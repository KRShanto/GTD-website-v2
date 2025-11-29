"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Upload, X, Copy, Check, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface UploadedFile {
  fileName: string;
  publicUrl: string;
  fileSize: number;
  contentType: string;
}

/**
 * Client component for Sevalla file upload utility
 *
 * Handles file selection, upload via presigned URLs, and displays the resulting public URLs.
 * Supports large files by uploading directly to Sevalla storage.
 */
export default function SevallaUploadClient() {
  const { toast } = useToast();
  const [files, setFiles] = useState<File[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{
    [key: string]: number;
  }>({});
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFiles((prevFiles) => [...prevFiles, ...acceptedFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    // Accept all file types
  });

  const removeFile = (index: number) => {
    setFiles((prevFiles) => {
      const newFiles = [...prevFiles];
      newFiles.splice(index, 1);
      return newFiles;
    });
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
  };

  const copyToClipboard = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedUrl(url);
      toast({
        title: "Copied!",
        description: "Public URL copied to clipboard",
      });
      setTimeout(() => setCopiedUrl(null), 2000);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy URL",
        variant: "destructive",
      });
    }
  };

  const uploadFile = async (file: File): Promise<UploadedFile | null> => {
    try {
      // Step 1: Get presigned URL
      const presignResponse = await fetch("/api/sevalla/upload-presign", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fileName: file.name,
          contentType: file.type || "application/octet-stream",
        }),
      });

      if (!presignResponse.ok) {
        const error = await presignResponse.json();
        throw new Error(error.error || "Failed to get upload URL");
      }

      const { uploadUrl, publicUrl, key } = await presignResponse.json();

      // Step 2: Upload file directly to Sevalla using presigned URL
      const uploadResponse = await fetch(uploadUrl, {
        method: "PUT",
        body: file,
        headers: {
          "Content-Type": file.type || "application/octet-stream",
        },
      });

      if (!uploadResponse.ok) {
        throw new Error("Failed to upload file to Sevalla");
      }

      return {
        fileName: file.name,
        publicUrl,
        fileSize: file.size,
        contentType: file.type || "application/octet-stream",
      };
    } catch (error) {
      console.error("Upload error:", error);
      throw error;
    }
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one file",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    setUploadProgress({});
    const newUploadedFiles: UploadedFile[] = [];

    try {
      // Upload files sequentially to avoid overwhelming the server
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileKey = `${file.name}-${i}`;

        try {
          setUploadProgress((prev) => ({
            ...prev,
            [fileKey]: 0,
          }));

          // Simulate progress (actual upload happens in browser, so we can't track real progress)
          // But we can show which file is being uploaded
          const uploadedFile = await uploadFile(file);

          if (uploadedFile) {
            newUploadedFiles.push(uploadedFile);
            setUploadProgress((prev) => ({
              ...prev,
              [fileKey]: 100,
            }));
          }
        } catch (error) {
          console.error(`Error uploading ${file.name}:`, error);
          toast({
            title: "Upload Failed",
            description: `Failed to upload ${file.name}: ${
              error instanceof Error ? error.message : "Unknown error"
            }`,
            variant: "destructive",
          });
        }
      }

      setUploadedFiles((prev) => [...prev, ...newUploadedFiles]);
      setFiles([]);

      if (newUploadedFiles.length > 0) {
        toast({
          title: "Success!",
          description: `Successfully uploaded ${newUploadedFiles.length} file(s)`,
        });
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast({
        title: "Error",
        description: "An error occurred during upload",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      setUploadProgress({});
    }
  };

  const clearUploaded = () => {
    setUploadedFiles([]);
  };

  return (
    <div className="space-y-6">
      {/* File Selection Area */}
      <Card className="bg-gradient-to-br from-gray-900 to-black border-orange-500/20">
        <CardContent className="p-6">
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all ${
              isDragActive
                ? "border-orange-500 bg-orange-500/10"
                : "border-gray-700 hover:border-orange-500/50"
            }`}
          >
            <input {...getInputProps()} />
            <Upload className="w-12 h-12 mx-auto mb-4 text-orange-500" />
            <p className="text-lg font-semibold mb-2">
              {isDragActive
                ? "Drop files here"
                : "Drag & drop files here, or click to select"}
            </p>
            <p className="text-sm text-gray-400">
              Supports all file types and large files
            </p>
          </div>

          {/* Selected Files List */}
          {files.length > 0 && (
            <div className="mt-6 space-y-2">
              <h3 className="text-sm font-semibold text-gray-300 mb-2">
                Selected Files ({files.length})
              </h3>
              {files.map((file, index) => (
                <div
                  key={`${file.name}-${index}`}
                  className="flex items-center justify-between p-3 bg-gray-800 rounded-lg"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">
                      {file.name}
                    </p>
                    <p className="text-xs text-gray-400">
                      {formatFileSize(file.size)} • {file.type || "Unknown type"}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeFile(index)}
                    className="ml-2 text-gray-400 hover:text-red-400"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              <Button
                onClick={handleUpload}
                disabled={uploading}
                className="w-full mt-4 bg-orange-500 hover:bg-orange-600"
              >
                {uploading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Upload {files.length} file(s)
                  </>
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Uploaded Files */}
      {uploadedFiles.length > 0 && (
        <Card className="bg-gradient-to-br from-gray-900 to-black border-orange-500/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-orange-400">
                Uploaded Files ({uploadedFiles.length})
              </h2>
              <Button
                variant="outline"
                size="sm"
                onClick={clearUploaded}
                className="border-gray-700 hover:bg-gray-800"
              >
                Clear
              </Button>
            </div>
            <div className="space-y-3">
              {uploadedFiles.map((uploaded, index) => (
                <div
                  key={index}
                  className="p-4 bg-gray-800 rounded-lg border border-gray-700"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white mb-1 truncate">
                        {uploaded.fileName}
                      </p>
                      <p className="text-xs text-gray-400 mb-2">
                        {formatFileSize(uploaded.fileSize)} • {uploaded.contentType}
                      </p>
                      <div className="flex items-center gap-2 p-2 bg-black rounded border border-gray-700">
                        <code className="text-xs text-orange-400 flex-1 truncate">
                          {uploaded.publicUrl}
                        </code>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 flex-shrink-0"
                          onClick={() => copyToClipboard(uploaded.publicUrl)}
                        >
                          {copiedUrl === uploaded.publicUrl ? (
                            <Check className="w-4 h-4 text-green-400" />
                          ) : (
                            <Copy className="w-4 h-4 text-gray-400" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}


