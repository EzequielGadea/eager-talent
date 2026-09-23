export type AvailableApplicant = {
  id: string;
  name: string;
  lastName: string;
  email: string | null;
  photo: string | null;
  title: string | null;
  role: {
    name: string;
  };
};