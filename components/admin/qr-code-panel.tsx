"use client";

import { useRef } from "react";
import { QRCodeCanvas, QRCodeSVG } from "qrcode.react";
import { Download, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export function QrCodePanel({ url, restaurantName }: { url: string; restaurantName: string }) {
  const canvasWrapperRef = useRef<HTMLDivElement>(null);
  const svgWrapperRef = useRef<HTMLDivElement>(null);

  function downloadPng() {
    const canvas = canvasWrapperRef.current?.querySelector("canvas");
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = "menu-qr.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  }

  function downloadSvg() {
    const svg = svgWrapperRef.current?.querySelector("svg");
    if (!svg) return;
    const serialized = new XMLSerializer().serializeToString(svg);
    const blob = new Blob([serialized], { type: "image/svg+xml" });
    const link = document.createElement("a");
    link.download = "menu-qr.svg";
    link.href = URL.createObjectURL(blob);
    link.click();
    URL.revokeObjectURL(link.href);
  }

  function handlePrint() {
    window.print();
  }

  return (
    <div>
      <Card className="print:hidden">
        <CardContent className="flex flex-col items-center gap-6 p-8">
          <div ref={canvasWrapperRef} className="hidden">
            <QRCodeCanvas value={url} size={1024} level="H" marginSize={2} />
          </div>
          <div ref={svgWrapperRef} className="rounded-2xl border bg-white p-6">
            <QRCodeSVG value={url} size={220} level="H" marginSize={2} />
          </div>
          <p className="text-sm text-muted-foreground">{url}</p>
          <div className="flex flex-wrap justify-center gap-2">
            <Button onClick={downloadPng} variant="outline">
              <Download className="size-4" /> Descargar PNG
            </Button>
            <Button onClick={downloadSvg} variant="outline">
              <Download className="size-4" /> Descargar SVG
            </Button>
            <Button onClick={handlePrint}>
              <Printer className="size-4" /> Imprimir
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="hidden flex-col items-center gap-4 py-16 print:flex">
        <h1 className="font-heading text-2xl font-semibold">{restaurantName}</h1>
        <QRCodeSVG value={url} size={320} level="H" marginSize={2} />
        <p className="text-sm text-muted-foreground">Escanea para ver el menú</p>
      </div>
    </div>
  );
}
