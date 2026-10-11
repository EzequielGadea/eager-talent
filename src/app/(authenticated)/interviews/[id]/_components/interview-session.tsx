"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  type ReactNode,
  type RefObject,
} from "react";

type InterviewVisit = {
  // Whether this visit already logged its note activity (created or edited).
  noteActivityLogged: boolean;
};

const InterviewSessionContext = createContext<RefObject<InterviewVisit> | null>(
  null,
);

export function InterviewSessionProvider({
  children,
}: {
  children: ReactNode;
}) {
  const visitRef = useRef<InterviewVisit>({ noteActivityLogged: false });

  // A visit starts when the page mounts. With cacheComponents, Next keeps a
  // left route hidden in <Activity> with its state, and effects run again when
  // it is shown, so coming back to the page also starts a new visit.
  useEffect(() => {
    visitRef.current = { noteActivityLogged: false };
  }, []);

  return (
    <InterviewSessionContext value={visitRef}>
      {children}
    </InterviewSessionContext>
  );
}

export function useInterviewVisit() {
  const visitRef = useContext(InterviewSessionContext);
  if (!visitRef) {
    throw new Error(
      "useInterviewVisit must be used inside InterviewSessionProvider",
    );
  }
  return visitRef;
}
