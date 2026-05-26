import React, { forwardRef, useRef, useState } from "react";
import {
  getUploadClasses,
  getUploadItemClasses,
  getUploadListClasses,
  uploadDropzoneClass,
  uploadInputClass,
  uploadItemActionsClass,
  uploadItemInfoClass,
  uploadItemNameClass,
  uploadItemSizeClass,
  uploadPreviewClass,
  uploadProgressBarClass,
  uploadProgressClass,
  uploadRemoveClass,
  uploadTriggerClass,
} from "../../classes/upload";
import type {
  UploadChangeParam,
  UploadComponent,
  UploadDraggerProps,
  UploadFile,
  UploadProps,
} from "./Upload.types";

const LIST_IGNORE = Symbol("Upload.LIST_IGNORE");

let uidSeed = 0;

function nextUid() {
  uidSeed += 1;
  return `upload-${Date.now()}-${uidSeed}`;
}

function ensureUid(file: UploadFile): UploadFile {
  return file.uid ? file : { ...file, uid: nextUid() };
}

function fileToUploadFile(file: File): UploadFile {
  return {
    uid: nextUid(),
    name: file.name,
    size: file.size,
    type: file.type,
    status: "uploading",
    percent: 0,
    originFileObj: file,
  };
}

function toFileList(files: FileList | File[]) {
  return Array.from(files);
}

function formatSize(size?: number) {
  if (size === undefined) return null;
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${Math.round(size / 102.4) / 10} KB`;
  return `${Math.round(size / 1024 / 102.4) / 10} MB`;
}

function UploadRoot(
  {
    accept,
    action,
    beforeUpload,
    children,
    className,
    customRequest,
    defaultFileList = [],
    disabled,
    fileList,
    listType = "text",
    multiple,
    onChange,
    onPreview,
    onRemove,
    dragger,
    ...props
  }: UploadProps & { dragger?: boolean },
  ref: React.ForwardedRef<HTMLDivElement>,
) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragover, setDragover] = useState(false);
  const [internalFileList, setInternalFileList] = useState<UploadFile[]>(
    () => defaultFileList.map(ensureUid),
  );
  const controlled = fileList !== undefined;
  const mergedFileList = (controlled ? fileList : internalFileList).map(ensureUid);
  const currentFileListRef = useRef(mergedFileList);
  currentFileListRef.current = mergedFileList;

  function commitFileList(
    nextFileList: UploadFile[],
    file: UploadFile,
    event?: UploadChangeParam["event"],
  ) {
    currentFileListRef.current = nextFileList;

    if (!controlled) {
      setInternalFileList(nextFileList);
    }

    onChange?.({ file, fileList: nextFileList, event });
  }

  function replaceFile(
    uid: string | undefined,
    patch: Partial<UploadFile>,
    event?: UploadChangeParam["event"],
  ) {
    const nextFileList = currentFileListRef.current.map((item) =>
      item.uid === uid ? { ...item, ...patch } : item,
    );
    const nextFile = nextFileList.find((item) => item.uid === uid);

    if (nextFile) {
      commitFileList(nextFileList, nextFile, event);
    }
  }

  function startRequest(uploadFile: UploadFile, sourceFile: File) {
    if (!customRequest) {
      replaceFile(uploadFile.uid, { status: "done", percent: 100 });
      return;
    }

    customRequest({
      action,
      file: sourceFile,
      filename: sourceFile.name,
      onProgress: (event) => {
        replaceFile(uploadFile.uid, { percent: event.percent }, event);
      },
      onSuccess: (response) => {
        replaceFile(uploadFile.uid, {
          status: "done",
          percent: 100,
          response,
        });
      },
      onError: (error) => {
        replaceFile(uploadFile.uid, { status: "error", error });
      },
    });
  }

  async function addFiles(files: File[]) {
    if (disabled) {
      return;
    }

    for (const sourceFile of files) {
      let uploadSource = sourceFile;

      if (beforeUpload) {
        const result = await beforeUpload(sourceFile, files);

        if (result === LIST_IGNORE) {
          continue;
        }

        const uploadFile = fileToUploadFile(sourceFile);

        if (result === false) {
          const nextFile = { ...uploadFile, status: undefined, percent: undefined };
          commitFileList([...currentFileListRef.current, nextFile], nextFile);
          continue;
        }

        if (result instanceof File) {
          uploadSource = result;
        } else if (result instanceof Blob) {
          uploadSource = new File([result], sourceFile.name, {
            type: result.type || sourceFile.type,
          });
        }

        const nextFile = fileToUploadFile(uploadSource);
        commitFileList([...currentFileListRef.current, nextFile], nextFile);
        startRequest(nextFile, uploadSource);
        continue;
      }

      const nextFile = fileToUploadFile(uploadSource);
      commitFileList([...currentFileListRef.current, nextFile], nextFile);
      startRequest(nextFile, uploadSource);
    }
  }

  function openFileDialog() {
    if (!disabled) {
      inputRef.current?.click();
    }
  }

  function commitRemove(file: UploadFile) {
    const removedFile = { ...file, status: "removed" as const };
    const nextFileList = currentFileListRef.current.filter((item) => item.uid !== file.uid);
    commitFileList(nextFileList, removedFile);
  }

  function removeFile(file: UploadFile) {
    if (disabled) {
      return;
    }

    const allowed = onRemove?.(file);

    if (allowed instanceof Promise) {
      void allowed.then((nextAllowed) => {
        if (nextAllowed !== false) {
          commitRemove(file);
        }
      });
      return;
    }

    if (allowed !== false) {
      commitRemove(file);
    }
  }

  function renderTrigger() {
    const trigger = children ?? <button type="button">Upload</button>;

    if (dragger) {
      return (
        <div
          className={uploadDropzoneClass}
          role="button"
          tabIndex={disabled ? -1 : 0}
          aria-disabled={disabled}
          onClick={openFileDialog}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              openFileDialog();
            }
          }}
          onDragEnter={(event) => {
            event.preventDefault();
            if (!disabled) setDragover(true);
          }}
          onDragOver={(event) => {
            event.preventDefault();
            if (!disabled) setDragover(true);
          }}
          onDragLeave={() => setDragover(false)}
          onDrop={(event) => {
            event.preventDefault();
            setDragover(false);
            void addFiles(toFileList(event.dataTransfer.files));
          }}
        >
          {trigger}
        </div>
      );
    }

    return (
      <span className={uploadTriggerClass} onClick={openFileDialog}>
        {trigger}
      </span>
    );
  }

  return (
    <div
      {...props}
      ref={ref}
      className={getUploadClasses({
        disabled,
        dragger,
        dragover,
        className,
      })}
    >
      <input
        ref={inputRef}
        className={uploadInputClass}
        type="file"
        hidden
        accept={accept}
        multiple={multiple}
        disabled={disabled}
        onChange={(event) => {
          void addFiles(toFileList(event.currentTarget.files ?? []));
          event.currentTarget.value = "";
        }}
      />
      {renderTrigger()}
      {mergedFileList.length > 0 ? (
        <div className={getUploadListClasses({ listType })}>
          {mergedFileList.map((file) => {
            const size = formatSize(file.size);

            return (
              <div key={file.uid} className={getUploadItemClasses({ status: file.status })}>
                <div className={uploadItemInfoClass}>
                  <button
                    type="button"
                    className={uploadPreviewClass}
                    disabled={disabled}
                    onClick={() => onPreview?.(file)}
                  >
                    <span className={uploadItemNameClass}>{file.name}</span>
                  </button>
                  {size ? <span className={uploadItemSizeClass}>{size}</span> : null}
                  {typeof file.percent === "number" ? (
                    <div
                      className={uploadProgressClass}
                      role="progressbar"
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-valuenow={file.percent}
                    >
                      <div
                        className={uploadProgressBarClass}
                        style={{ width: `${Math.max(0, Math.min(100, file.percent))}%` }}
                      />
                    </div>
                  ) : null}
                </div>
                <div className={uploadItemActionsClass}>
                  <button
                    type="button"
                    className={uploadRemoveClass}
                    disabled={disabled}
                    aria-label={`Remove ${file.name}`}
                    onClick={() => removeFile(file)}
                  >
                    x
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

const UploadFrame = forwardRef<HTMLDivElement, UploadProps & { dragger?: boolean }>(
  UploadRoot,
);
UploadFrame.displayName = "Upload";

const Dragger = forwardRef<HTMLDivElement, UploadDraggerProps>((props, ref) => (
  <UploadFrame {...props} ref={ref} dragger />
));
Dragger.displayName = "Upload.Dragger";

export const Upload = UploadFrame as UploadComponent;
Upload.Dragger = Dragger;
Upload.LIST_IGNORE = LIST_IGNORE;
