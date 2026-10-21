"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  type ReactNode,
  type RefObject,
} from "react";

type ApplicantProfileVisit = {
  // Whether this visit already logged its note activity (created or edited).
  noteActivityLogged: boolean;
};

const ApplicantProfileSessionContext =
  createContext<RefObject<ApplicantProfileVisit> | null>(null);

export function ApplicantProfileSessionProvider({
  children,
}: {
  children: ReactNode;
}) {
  const visitRef = useRef<ApplicantProfileVisit>({ noteActivityLogged: false });

  // A visit starts when the profile mounts. With cacheComponents, Next keeps a
  // left route hidden in <Activity> with its state, and effects run again when
  // it is shown, so coming back to the profile also starts a new visit.
  useEffect(() => {
    visitRef.current = { noteActivityLogged: false };
  }, []);

  return (
    <ApplicantProfileSessionContext value={visitRef}>
      {children}
    </ApplicantProfileSessionContext>
  );
}

export function useApplicantProfileVisit() {
  const visitRef = useContext(ApplicantProfileSessionContext);
  if (!visitRef) {
    throw new Error(
      "useApplicantProfileVisit must be used inside ApplicantProfileSessionProvider",
    );
  }
  return visitRef;
}
