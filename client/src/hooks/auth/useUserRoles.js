import { useUserProfile } from "../profile/useUserProfile";

export function useIsTutor() {
  const { data: user } = useUserProfile();
  return user?.role === "tutor";
}

export function useTutorStatus() {
  const { data: user } = useUserProfile();
  const tutor = user?.tutor;

  if (!tutor) return null;

  if (tutor.approvalStatus === "approved" && user.accountStatus === "active") {
    return "active";
  }

  return tutor.approvalStatus;
}

export function useIsSuperAdmin() {
  const { data: user } = useUserProfile();
  return user?.role === "admin" && user?.admin?.isSuperAdmin;
}
