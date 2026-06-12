import RescueDetailPage from "./client-page";

export function generateStaticParams() {
  return [{ id: "fallback" }];
}

export const metadata = {
  title: "Rescue Case Details | EcoVerse India",
  description: "Track the dispatch progress and real-time status of animal rescue emergencies.",
};

export default function Page() {
  return <RescueDetailPage />;
}
