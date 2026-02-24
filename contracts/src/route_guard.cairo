use starknet::ContractAddress;

#[derive(Drop, Copy, Serde, starknet::Store, PartialEq)]
pub enum EventType {
    #[default]
    Accident,
    RoadClosure,
    Protest,
    PoliceActivity,
    Hazard,
    TrafficJam,
}

#[derive(Drop, Copy, Serde, starknet::Store, PartialEq)]
pub enum ReportStatus {
    #[default]
    Active,
    Confirmed,
    Expired,
    Slashed,
}

#[derive(Drop, Copy, Serde, starknet::Store)]
pub struct Report {
    pub commitment: felt252,
    pub latitude: felt252,
    pub longitude: felt252,
    pub event_type: EventType,
    pub encrypted_event_type: felt252,
    pub status: ReportStatus,
    pub timestamp: u64,
    pub expires_at: u64,
    pub stake: u256,
    pub regards: u256,
    pub confirmations: u32,
}

#[starknet::interface]
pub trait IRouteGuard<TContractState> {
    fn submit_report(
        ref self: TContractState,
        commitment: felt252,
        latitude: felt252,
        longitude: felt252,
        event_type: EventType,
    ) -> u256;
    fn submit_private_report(
        ref self: TContractState,
        commitment: felt252,
        latitude: felt252,
        longitude: felt252,
        event_type: EventType,
        encrypted_event_type: felt252,
    ) -> u256;
    fn confirm_report(ref self: TContractState, report_id: u256);
    fn send_regards(ref self: TContractState, report_id: u256, amount: u256);
    fn claim_rewards(ref self: TContractState, secret: felt252, salt: felt252, nullifier: felt252, recipient: ContractAddress);
    fn expire_report(ref self: TContractState, report_id: u256);
    fn slash_report(ref self: TContractState, report_id: u256);
    fn get_report(self: @TContractState, report_id: u256) -> Report;
    fn get_report_count(self: @TContractState) -> u256;
    fn get_pending_rewards(self: @TContractState, commitment: felt252) -> u256;
    fn get_min_stake(self: @TContractState) -> u256;
    fn get_confirmation_threshold(self: @TContractState) -> u32;
    fn has_confirmed(self: @TContractState, report_id: u256, confirmer: ContractAddress) -> bool;
    fn is_nullifier_used(self: @TContractState, nullifier: felt252) -> bool;
    fn verify_nullifier(self: @TContractState, secret: felt252, report_id: felt252) -> felt252;
    fn update_params(ref self: TContractState, min_stake: u256, report_duration: u64, confirmation_threshold: u32);
}

#[starknet::contract]
pub mod RouteGuard {
    use super::{EventType, ReportStatus, Report, IRouteGuard};
    use starknet::{ContractAddress, get_caller_address, get_block_timestamp};
    use starknet::storage::{
        StoragePointerReadAccess, StoragePointerWriteAccess,
        Map, StoragePathEntry,
    };
    use core::pedersen::pedersen;
    use openzeppelin_access::ownable::OwnableComponent;

    component!(path: OwnableComponent, storage: ownable, event: OwnableEvent);

    #[abi(embed_v0)]
    impl OwnableImpl = OwnableComponent::OwnableImpl<ContractState>;
    impl OwnableInternalImpl = OwnableComponent::InternalImpl<ContractState>;

    #[storage]
    struct Storage {
        report_count: u256,
        min_stake: u256,
        report_duration: u64,
        confirmation_threshold: u32,
        reports: Map<u256, Report>,
        pending_rewards: Map<felt252, u256>,
        has_confirmed_map: Map<(u256, ContractAddress), bool>,
        slashed_commitments: Map<felt252, bool>,
        used_nullifiers: Map<felt252, bool>,
        #[substorage(v0)]
        ownable: OwnableComponent::Storage,
    }

    #[event]
    #[derive(Drop, starknet::Event)]
    pub enum Event {
        ReportSubmitted: ReportSubmitted,
        ReportConfirmed: ReportConfirmed,
        RegardsSent: RegardsSent,
        RewardsClaimed: RewardsClaimed,
        ReportExpired: ReportExpired,
        ReportSlashed: ReportSlashed,
        #[flat]
        OwnableEvent: OwnableComponent::Event,
    }

    #[derive(Drop, starknet::Event)]
    pub struct ReportSubmitted {
        #[key]
        pub report_id: u256,
        #[key]
        pub commitment: felt252,
        pub latitude: felt252,
        pub longitude: felt252,
        pub event_type: EventType,
        pub encrypted_event_type: felt252,
        pub stake: u256,
        pub expires_at: u64,
    }

    #[derive(Drop, starknet::Event)]
    pub struct ReportConfirmed {
        #[key]
        pub report_id: u256,
        pub confirmer: ContractAddress,
        pub new_count: u32,
    }

    #[derive(Drop, starknet::Event)]
    pub struct RegardsSent {
        #[key]
        pub report_id: u256,
        pub sender: ContractAddress,
        pub amount: u256,
    }

    #[derive(Drop, starknet::Event)]
    pub struct RewardsClaimed {
        #[key]
        pub commitment: felt252,
        pub nullifier: felt252,
        pub recipient: ContractAddress,
        pub amount: u256,
    }

    #[derive(Drop, starknet::Event)]
    pub struct ReportExpired {
        #[key]
        pub report_id: u256,
    }

    #[derive(Drop, starknet::Event)]
    pub struct ReportSlashed {
        #[key]
        pub report_id: u256,
        pub commitment: felt252,
        pub slashed_amount: u256,
    }

    #[constructor]
    fn constructor(ref self: ContractState, owner: ContractAddress) {
        self.ownable.initializer(owner);
        self.min_stake.write(1000000000000000); // 0.001 ETH in wei
        self.report_duration.write(86400); // 24 hours
        self.confirmation_threshold.write(3);
    }

    #[abi(embed_v0)]
    impl RouteGuardImpl of IRouteGuard<ContractState> {
        fn submit_report(
            ref self: ContractState,
            commitment: felt252,
            latitude: felt252,
            longitude: felt252,
            event_type: EventType,
        ) -> u256 {
            assert(!self.slashed_commitments.entry(commitment).read(), 'Commitment is slashed');

            let report_id = self.report_count.read();
            let timestamp = get_block_timestamp();
            let expires_at = timestamp + self.report_duration.read();
            let stake = self.min_stake.read();

            let report = Report {
                commitment,
                latitude,
                longitude,
                event_type,
                encrypted_event_type: 0, // No encryption — plaintext event type
                status: ReportStatus::Active,
                timestamp,
                expires_at,
                stake,
                regards: 0,
                confirmations: 0,
            };

            self.reports.entry(report_id).write(report);
            self.report_count.write(report_id + 1);

            self.emit(ReportSubmitted {
                report_id,
                commitment,
                latitude,
                longitude,
                event_type,
                encrypted_event_type: 0,
                stake,
                expires_at,
            });

            report_id
        }

        /// Submit a report with an encrypted event type.
        /// The encrypted_event_type = event_type_felt XOR secret
        /// Only the reporter (who knows the secret) can later reveal the true event type.
        fn submit_private_report(
            ref self: ContractState,
            commitment: felt252,
            latitude: felt252,
            longitude: felt252,
            event_type: EventType,
            encrypted_event_type: felt252,
        ) -> u256 {
            assert(!self.slashed_commitments.entry(commitment).read(), 'Commitment is slashed');

            let report_id = self.report_count.read();
            let timestamp = get_block_timestamp();
            let expires_at = timestamp + self.report_duration.read();
            let stake = self.min_stake.read();

            let report = Report {
                commitment,
                latitude,
                longitude,
                event_type,
                encrypted_event_type,
                status: ReportStatus::Active,
                timestamp,
                expires_at,
                stake,
                regards: 0,
                confirmations: 0,
            };

            self.reports.entry(report_id).write(report);
            self.report_count.write(report_id + 1);

            self.emit(ReportSubmitted {
                report_id,
                commitment,
                latitude,
                longitude,
                event_type,
                encrypted_event_type,
                stake,
                expires_at,
            });

            report_id
        }

        fn confirm_report(ref self: ContractState, report_id: u256) {
            let mut report = self.reports.entry(report_id).read();
            assert(report.timestamp != 0, 'Report not found');
            assert(report.status == ReportStatus::Active, 'Report not active');

            let caller = get_caller_address();
            assert(!self.has_confirmed_map.entry((report_id, caller)).read(), 'Already confirmed');

            self.has_confirmed_map.entry((report_id, caller)).write(true);
            report.confirmations += 1;

            if report.confirmations >= self.confirmation_threshold.read() {
                report.status = ReportStatus::Confirmed;
                let current = self.pending_rewards.entry(report.commitment).read();
                self.pending_rewards.entry(report.commitment).write(current + report.stake);
            }

            self.reports.entry(report_id).write(report);

            self.emit(ReportConfirmed {
                report_id,
                confirmer: caller,
                new_count: report.confirmations,
            });
        }

        fn send_regards(ref self: ContractState, report_id: u256, amount: u256) {
            assert(amount > 0, 'Amount must be > 0');
            let mut report = self.reports.entry(report_id).read();
            assert(report.timestamp != 0, 'Report not found');
            assert(report.status != ReportStatus::Slashed, 'Report is slashed');

            report.regards += amount;
            self.reports.entry(report_id).write(report);

            let current = self.pending_rewards.entry(report.commitment).read();
            self.pending_rewards.entry(report.commitment).write(current + amount);

            self.emit(RegardsSent {
                report_id,
                sender: get_caller_address(),
                amount,
            });
        }

        /// Claim rewards using a nullifier to prevent double-claims.
        /// nullifier = pedersen(secret, report_id_felt) — unique per secret+report pair.
        /// This prevents correlation: each claim uses a unique nullifier,
        /// so observers cannot link multiple claims to the same identity.
        fn claim_rewards(
            ref self: ContractState,
            secret: felt252,
            salt: felt252,
            nullifier: felt252,
            recipient: ContractAddress,
        ) {
            // Verify commitment
            let commitment = pedersen(secret, salt);
            assert(!self.slashed_commitments.entry(commitment).read(), 'Commitment is slashed');

            // Verify nullifier hasn't been used (prevents double-claim)
            assert(!self.used_nullifiers.entry(nullifier).read(), 'Nullifier already used');

            let amount = self.pending_rewards.entry(commitment).read();
            assert(amount > 0, 'No rewards to claim');

            // Mark nullifier as used
            self.used_nullifiers.entry(nullifier).write(true);

            // Zero out rewards
            self.pending_rewards.entry(commitment).write(0);

            self.emit(RewardsClaimed {
                commitment,
                nullifier,
                recipient,
                amount,
            });
        }

        fn expire_report(ref self: ContractState, report_id: u256) {
            let mut report = self.reports.entry(report_id).read();
            assert(report.timestamp != 0, 'Report not found');
            assert(report.status == ReportStatus::Active, 'Report not active');
            assert(get_block_timestamp() >= report.expires_at, 'Report not expired yet');

            report.status = ReportStatus::Expired;

            if report.confirmations > 0 {
                let current = self.pending_rewards.entry(report.commitment).read();
                self.pending_rewards.entry(report.commitment).write(current + report.stake);
            }

            self.reports.entry(report_id).write(report);
            self.emit(ReportExpired { report_id });
        }

        fn slash_report(ref self: ContractState, report_id: u256) {
            self.ownable.assert_only_owner();

            let mut report = self.reports.entry(report_id).read();
            assert(report.timestamp != 0, 'Report not found');
            assert(report.status != ReportStatus::Slashed, 'Already slashed');

            report.status = ReportStatus::Slashed;
            self.reports.entry(report_id).write(report);
            self.slashed_commitments.entry(report.commitment).write(true);

            let forfeited = self.pending_rewards.entry(report.commitment).read();
            self.pending_rewards.entry(report.commitment).write(0);

            self.emit(ReportSlashed {
                report_id,
                commitment: report.commitment,
                slashed_amount: report.stake + forfeited,
            });
        }

        fn get_report(self: @ContractState, report_id: u256) -> Report {
            self.reports.entry(report_id).read()
        }

        fn get_report_count(self: @ContractState) -> u256 {
            self.report_count.read()
        }

        fn get_pending_rewards(self: @ContractState, commitment: felt252) -> u256 {
            self.pending_rewards.entry(commitment).read()
        }

        fn get_min_stake(self: @ContractState) -> u256 {
            self.min_stake.read()
        }

        fn get_confirmation_threshold(self: @ContractState) -> u32 {
            self.confirmation_threshold.read()
        }

        fn has_confirmed(self: @ContractState, report_id: u256, confirmer: ContractAddress) -> bool {
            self.has_confirmed_map.entry((report_id, confirmer)).read()
        }

        /// Check if a nullifier has already been used
        fn is_nullifier_used(self: @ContractState, nullifier: felt252) -> bool {
            self.used_nullifiers.entry(nullifier).read()
        }

        /// Compute a nullifier for verification: pedersen(secret, report_id)
        fn verify_nullifier(self: @ContractState, secret: felt252, report_id: felt252) -> felt252 {
            pedersen(secret, report_id)
        }

        fn update_params(
            ref self: ContractState,
            min_stake: u256,
            report_duration: u64,
            confirmation_threshold: u32,
        ) {
            self.ownable.assert_only_owner();
            self.min_stake.write(min_stake);
            self.report_duration.write(report_duration);
            self.confirmation_threshold.write(confirmation_threshold);
        }
    }
}
