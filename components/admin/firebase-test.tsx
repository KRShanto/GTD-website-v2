"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  uploadImageToFirebase,
  deleteImageFromFirebase,
} from "@/lib/firebase/storage";
import { toast } from "sonner";

export default function FirebaseTest() {
  const [isUploading, setIsUploading] = useState(false);
  const [testResults, setTestResults] = useState<{
    upload: boolean;
    delete: boolean;
    url?: string;
  }>({ upload: false, delete: false });

  const handleTestUpload = async () => {
    setIsUploading(true);
    setTestResults({ upload: false, delete: false });

    try {
      // Create a simple test image
      const canvas = document.createElement("canvas");
      canvas.width = 100;
      canvas.height = 100;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.fillStyle = "#ff6b35";
        ctx.fillRect(0, 0, 100, 100);
        ctx.fillStyle = "white";
        ctx.font = "16px Arial";
        ctx.fillText("Test", 30, 50);
      }

      canvas.toBlob(async (blob) => {
        if (blob) {
          const file = new File([blob], "test-image.png", {
            type: "image/png",
          });
          const result = await uploadImageToFirebase(
            file,
            "test-image.png",
            "test"
          );

          if (result.success && result.url) {
            toast.success("Firebase upload test successful!");
            console.log("Upload URL:", result.url);
            setTestResults({ upload: true, delete: false, url: result.url });

            // Test deletion after 3 seconds
            setTimeout(async () => {
              const deleteResult = await deleteImageFromFirebase(result.url!);
              if (deleteResult) {
                toast.success("Firebase delete test successful!");
                setTestResults((prev) => ({ ...prev, delete: true }));
              } else {
                toast.error("Firebase delete test failed");
              }
            }, 3000);
          } else {
            toast.error("Firebase upload test failed: " + result.error);
          }
        }
      }, "image/png");
    } catch (error) {
      toast.error("Test failed: " + error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="p-4 border rounded-lg bg-gray-800 border-gray-600">
      <h3 className="text-lg font-semibold mb-4 text-white">
        Firebase Storage Test
      </h3>
      <Button
        onClick={handleTestUpload}
        disabled={isUploading}
        className="bg-orange-500 hover:bg-orange-600 mb-4"
      >
        {isUploading ? "Testing..." : "Test Firebase Upload & Delete"}
      </Button>

      {testResults.upload && (
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-green-400">Upload: Success</span>
          </div>
          {testResults.url && (
            <div className="text-gray-400 break-all">
              URL: {testResults.url}
            </div>
          )}
          {testResults.delete && (
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-green-400">Delete: Success</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
