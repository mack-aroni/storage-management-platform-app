import Link from "next/link";
import Image from "next/image";
import { Models } from "node-appwrite";
import { Separator } from "@/components/ui/separator";
import Dropdown from "@/components/Dropdown";
import Chart from "@/components/Chart";
import DateTime from "@/components/DateTime";
import Thumbnail from "@/components/Thumbnail";
import { convertFileSize, getUsageSummary } from "@/lib/utils";
import { getFiles, getTotalSpaceUsed } from "@/lib/actions/file.actions";

const Dashboard = async () => {
  // use parallel requests
  const [files, totalSpace] = await Promise.all([
    getFiles({ types: [], limit: 10 }),
    getTotalSpaceUsed(),
  ]);

  const usageSummary = getUsageSummary(totalSpace);

  return (
    <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 md:grid-cols-2 xl:gap-10">
      <section>
        <Chart used={totalSpace.used} />

        {/* File Type Summaries */}
        <ul className="mt-6 grid grid-cols-1 gap-4 xl:mt-10 xl:grid-cols-2 xl:gap-9">
          {usageSummary.map((summary) => (
            <Link href={summary.url}
              key={summary.title}
              className="relative mt-6 rounded-[20px] bg-white p-5 transition-all hover:scale-105">
            
            <div className="space-y-4">
              <div className="flex justify-between gap-3">
                <Image src={summary.icon}
                  width={100}
                  height={100}
                  alt="uploaded image"
                  className="absolute -left-3 top-[-25px] z-10 w-[190px] object-contain"/>

                <h4 className="h4 relative z-20 w-full text-right">
                  {convertFileSize(summary.size) || 0}
                </h4>
              </div>

              <h5 className="h5 relative z-20 text-center">
                {summary.title}
              </h5>

              <Separator className="bg-light-400" />

              <DateTime date={summary.latestDate} className="text-center"/>
            </div>
          </Link>))
        }
      </ul>
    </section>

      {/* Recent files uploaded */}
      <section className="h-full rounded-[20px] bg-white p-5 xl:p-8">
        <h2 className="h3 xl:h2 text-light-100">
          Recent Files Uploaded
        </h2>

        {files.rows.length > 0 ? (
          <ul className="mt-5 flex flex-col gap-5">
            {files.rows.map((file: Models.DefaultRow) => (
              <Link href={file.url}
                target="_blank"
                className="flex items-center gap-3"
                key={file.$id}>

                <Thumbnail type={file.type}
                  extension={file.extension}
                  url={file.url}/>

                <div className="flex w-full flex-col xl:flex-row xl:justify-between">
                  <div className="flex flex-col gap-1">
                    <p className="subtitle-2 line-clamp-1 w-full text-light-100 sm:max-w-[200px] lg:max-w-[250px]">
                      {file.name}
                    </p>

                    <DateTime date={file.$createdAt} className="caption"/>
                  </div>

                  <Dropdown file={file} />
                </div>
              </Link>
            ))}
          </ul>
        ) : (
          <p className="body-1 mt-10 text-center text-light-200">
            No files uploaded
          </p>
        )}
      </section>
    </div>
  );
};

export default Dashboard;