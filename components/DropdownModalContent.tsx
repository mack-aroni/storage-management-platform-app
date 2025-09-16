import React from "react";
import { Models } from "node-appwrite";
import Image from "next/image";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import Thumbnail from "./Thumbnail";
import FormattedDateTime from "./DateTime";
import { convertFileSize, formatDateTime } from "@/lib/utils";

// Helper Thumbnail Component
const ImageThumbnail = ({ file }: { file: Models.DefaultRow }) => (
  <div className="mb-1 flex items-center gap-3 rounded-xl border border-light-200/40 bg-light-400/50 p-3">
    <Thumbnail type={file.type} extension={file.extension} url={file.url}/>

    <div className="flex flex-col">
      <p className="subtitle-2 mb-1">
        {file.name}
      </p>

      <FormattedDateTime date={file.$createdAt} className="caption" />
    </div>
  </div>
);

// Helper File Details Text Component
const DetailRow = ({ label, value }: { label: string; value: string }) => (
  <div className="flex">
    <p className="w-[30%] text-light-100;">{label}</p>
    <p className="flex-1">{value}</p>
  </div>
);

// Details Dropdown Action Component
export const FileDetails = ({ file }: { file: Models.DefaultRow }) => {
  return (
    <>
      <ImageThumbnail file={file} />

      <div className="space-y-4 px-2 pt-2">
        <DetailRow label={"Format:"} value={file.extension} />
        <DetailRow label={"Size:"} value={convertFileSize(file.size)} />
        <DetailRow label={"Owner:"} value={file.owner.fullName} />
        <DetailRow label={"Last Edit:"} value={formatDateTime(file.$updatedAt)} />
      </div>
    </>
  );
};

interface Props {
  file: Models.DefaultRow;
  onInputChange: React.Dispatch<React.SetStateAction<string[]>>;
  onRemove: (email: string) => void;
};

// Share Dropdown Action Component
export const ShareInput = ({ file, onInputChange, onRemove }: Props) => {
  return (
    <>
      <ImageThumbnail file={file} />
      
      <div className="mt-2 space-y-2">
        <p className="subtitle-2 pl-1 text-light-100">
          Share file with other users
        </p>

        <Input type="email"
          placeholder="Enter email address"
          onChange={e => onInputChange(e.target.value.trim().split(","))}
          className="body-2 shad-no-focus h-[52px] w-full rounded-full border px-4 shadow-drop-1"/>

        <div className="pt-4">
          <div className="flex justify-between">
            <p className="subtitle-2 text-light-100">
              Shared with
            </p>

            <p className="subtitle-2 text-light-100">
              {file.users.length} users
            </p>
          </div>

          <ul className="pt-2">
            {file.users.map((email: string) => (
              <li key={email} className="flex items-center justify-between gap-2">
                <p className="subtitle-2">
                  {email}
                </p>
                
                <Button onClick={() => onRemove(email)}
                  className="rounded-full bg-transparent text-light-100 shadow-none hover:bg-transparent">
                  <Image src="assets/icons/remove.svg"
                    alt="remove"
                    width={24}
                    height={24}
                    className="remove-icon" />
                </Button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
};
