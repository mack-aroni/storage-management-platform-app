import { getFiles } from "@/lib/actions/file.actions";
import React from "react";

interface Props {
  params: Promise<{ type?: string }>;
};

const typeMap: Record<string, FileType[]> = {
  documents: ["document"],
  images: ["image"],
  media: ["video", "audio"],
  others: ["other"],
};

const page = async ({ params } : Props) => {
  const { type: typeParam } = await params;
  const types = typeParam && typeMap[typeParam] || ["document"];

  const files = await getFiles();

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col items-center gap-8">
      <section className="w-full">
        <h1 className="h1 capitalize">
          {typeParam}
        </h1>

        <div className="mt-2 flex flex-col justify-between sm:flex-row sm:items-center">
          <p className="body-1">
            Total: {" "}
            <span className="h5">
              0 MB
            </span>
          </p>

          <div className="mt-5 flex items-center sm:mt-0 sm:gap-3">
            <p className="body-1 hidden sm:block text-light-200">
              Sort By: 
            </p>
            Sort
          </div>
        </div>
      </section>

      {/* Dynamically Render Uploaded Files */}
      {files.total > 0 ? (
        <section className="grid w-full gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <p>Card</p>
        </section>
      ) : (
        <p className="empty-list">
          No files uploaded
        </p>
      )}
    </div>
  );
};

export default page;