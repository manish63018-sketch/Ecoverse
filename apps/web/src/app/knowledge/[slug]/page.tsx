import ArticleDetailPage from "./client-page";
import { STARTER_ARTICLES } from "@/lib/articles";

export function generateStaticParams() {
  return STARTER_ARTICLES.map((article) => ({
    slug: article.slug,
  }));
}

export const metadata = {
  title: "Knowledge Hub Article | EcoVerse India",
  description: "Read educational articles and guides on animal rescue, welfare laws, and vegan living.",
};

export default function Page() {
  return <ArticleDetailPage />;
}
