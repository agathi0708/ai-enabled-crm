import { useRef, useState } from "react";
import { importContacts } from "../../api/contacts";

function ImportContacts({ onClose, onImported }) {
  const fileInputRef = useRef(null);

  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  function handleFileChange(event) {
    const selectedFile = event.target.files?.[0];

    setError("");
    setResult(null);

    if (!selectedFile) {
      setFile(null);
      return;
    }

    if (
      !selectedFile.name
        .toLowerCase()
        .endsWith(".csv")
    ) {
      setFile(null);
      setError("Please select a CSV file.");
      return;
    }

    if (selectedFile.size > 5 * 1024 * 1024) {
      setFile(null);
      setError(
        "CSV file must be 5 MB or smaller."
      );
      return;
    }

    setFile(selectedFile);
  }

  function chooseFile() {
    fileInputRef.current?.click();
  }

  function removeFile() {
    setFile(null);
    setResult(null);
    setError("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  async function handleImport() {
    if (!file) {
      setError("Please choose a CSV file.");
      return;
    }

    try {
      setUploading(true);
      setError("");
      setResult(null);

      /*
       * The owner ID is no longer supplied by the
       * frontend. The backend gets it from req.user.id
       * using the authenticated JWT.
       */
      const response = await importContacts(file);

      setResult(response.data);

      onImported?.(response.data);
    } catch (err) {
      setError(
        err.message ||
          "Failed to import contacts"
      );
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
      <div className="flex max-h-[90vh] w-full max-w-xl flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl">

        {/* Header */}
        <div className="shrink-0 border-b border-slate-200 px-6 py-5 lg:px-7">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="mb-2 inline-flex items-center rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700">
                Bulk Import
              </div>

              <h2 className="text-xl font-bold tracking-tight text-slate-900">
                Import Contacts
              </h2>

              <p className="mt-1 text-sm leading-6 text-slate-500">
                Upload a CSV file to add multiple
                contacts to your CRM.
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              disabled={uploading}
              aria-label="Close import dialog"
              className="grid h-9 w-9 shrink-0 place-items-center rounded-xl text-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              ×
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6 lg:px-7">
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,text/csv"
            onChange={handleFileChange}
            className="hidden"
          />

          {/* Upload area */}
          <button
            type="button"
            onClick={chooseFile}
            disabled={uploading}
            className="group w-full rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 px-6 py-10 text-center transition hover:border-indigo-300 hover:bg-indigo-50/40 disabled:cursor-not-allowed"
          >
            <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-white text-2xl text-indigo-600 shadow-sm transition group-hover:scale-105">
              ↑
            </div>

            <div className="text-sm font-semibold text-slate-900">
              {file
                ? "CSV file selected"
                : "Choose a CSV file"}
            </div>

            <div className="mt-2 text-xs text-slate-500">
              {file
                ? file.name
                : "Click here to browse your computer"}
            </div>

            <div className="mt-3 text-xs text-slate-400">
              CSV only · Maximum file size 5 MB
            </div>
          </button>

          {/* Selected file */}
          {file && (
            <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4">
              <div className="flex items-center justify-between gap-4">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-emerald-50 text-xs font-bold text-emerald-600">
                    CSV
                  </div>

                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold text-slate-800">
                      {file.name}
                    </div>

                    <div className="mt-1 text-xs text-slate-500">
                      {(file.size / 1024).toFixed(1)} KB
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={removeFile}
                  disabled={uploading}
                  className="shrink-0 rounded-lg px-2 py-1 text-sm font-medium text-slate-500 transition hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                >
                  Remove
                </button>
              </div>
            </div>
          )}

          {/* Format information */}
          {!result && !error && (
            <div className="mt-5 rounded-2xl border border-slate-100 bg-slate-50 p-4">
              <div className="text-sm font-semibold text-slate-800">
                CSV format
              </div>

              <p className="mt-1 text-xs leading-5 text-slate-500">
                Include columns such as name, company,
                email, phone, status, tags, source,
                and notes.
              </p>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="mt-5 rounded-2xl border border-red-100 bg-red-50 p-4">
              <div className="flex gap-3">
                <div className="text-red-500">
                  ⚠
                </div>

                <div>
                  <div className="text-sm font-semibold text-red-800">
                    Import failed
                  </div>

                  <div className="mt-1 text-sm leading-6 text-red-700">
                    {error}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Results */}
          {result && (
            <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="mb-4">
                <div className="text-sm font-semibold text-slate-900">
                  Import completed
                </div>

                <div className="mt-1 text-xs text-slate-500">
                  Review the result below.
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">

                {/* Imported */}
                <div className="rounded-2xl bg-white p-4 shadow-sm">
                  <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Imported
                  </div>

                  <div className="mt-2 text-3xl font-bold text-emerald-600">
                    {result.imported}
                  </div>

                  <div className="mt-1 text-xs text-slate-500">
                    contacts added successfully
                  </div>
                </div>

                {/* Failed */}
                <div className="rounded-2xl bg-white p-4 shadow-sm">
                  <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Failed
                  </div>

                  <div className="mt-2 text-3xl font-bold text-red-600">
                    {result.failed}
                  </div>

                  <div className="mt-1 text-xs text-slate-500">
                    rows could not be imported
                  </div>
                </div>
              </div>

              {/* Errors */}
              {result.errors?.length > 0 && (
                <div className="mt-5">
                  <div className="mb-2 text-sm font-semibold text-slate-800">
                    Import errors
                  </div>

                  <div className="max-h-48 overflow-y-auto rounded-2xl border border-slate-200 bg-white">
                    {result.errors.map(
                      (item, index) => (
                        <div
                          key={`${item.row}-${index}`}
                          className="border-b border-slate-100 px-4 py-3 text-sm last:border-b-0"
                        >
                          <span className="font-semibold text-slate-700">
                            Row {item.row}
                          </span>

                          <span className="mx-2 text-slate-300">
                            •
                          </span>

                          <span className="text-slate-500">
                            {item.message}
                          </span>
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}

              {result.failed === 0 && (
                <div className="mt-4 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
                  All valid CSV rows were imported
                  successfully.
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex shrink-0 justify-end gap-3 border-t border-slate-200 bg-white px-6 py-4 lg:px-7">
          <button
            type="button"
            onClick={onClose}
            disabled={uploading}
            className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Close
          </button>

          <button
            type="button"
            onClick={handleImport}
            disabled={!file || uploading}
            className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {uploading
              ? "Importing..."
              : result
                ? "Import Again"
                : "Import Contacts"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ImportContacts;