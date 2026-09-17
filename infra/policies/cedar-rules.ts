// ============================================================================
// Cedar Authorization Policy Rules Skeleton (Person 3 - feature/cloud-platform)
// ============================================================================
// Cedar is used for fine-grained authorization (e.g., ensuring a worker only
// accesses their own evidence, trips, and cases). It is not an automated legal judge.

export const CEDAR_BASE_POLICIES = `
// Permit a worker to access only their own worker profile, trips, and earnings
permit (
    principal is Kavach::Worker,
    action in [
        Kavach::Action::"ReadProfile",
        Kavach::Action::"ReadEarnings",
        Kavach::Action::"ReadTrips",
        Kavach::Action::"UploadEvidence",
        Kavach::Action::"CreateCase"
    ],
    resource
)
when {
    principal.id == resource.workerId
};
`;
