import { notFound } from "next/navigation";
import Home from "../../page";

export const metadata = {
  title: "Research Studio preview | Vaishnav Gadamsetty",
  robots: { index: false, follow: false },
};

export default function ResearchStudioPreview() {
  if (process.env.NODE_ENV !== "development" && process.env.RESEARCH_STUDIO_PREVIEW !== "1") notFound();
  return <Home />;
}
