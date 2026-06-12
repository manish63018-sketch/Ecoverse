import PetDetailPage from "./client-page";

export function generateStaticParams() {
  return [{ id: "fallback" }];
}

export const metadata = {
  title: "Adopt Animal Profile | EcoVerse India",
  description: "View details and medical records of animals looking for loving homes.",
};

export default function Page() {
  return <PetDetailPage />;
}
