package com.documentverification.backend.service;

import java.awt.AlphaComposite;
import java.awt.Graphics2D;
import java.awt.RenderingHints;
import java.awt.image.BufferedImage;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Locale;
import java.util.UUID;
import javax.imageio.ImageIO;

import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.PDPageContentStream.AppendMode;
import org.apache.pdfbox.pdmodel.graphics.image.PDImageXObject;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import com.documentverification.backend.entity.Document;
import com.documentverification.backend.entity.StampPosition;

/**
 * Creates a separate stamped copy. The uploaded original is never modified.
 * The fixed stamp PNG is bundled at static/mydocsrsa-certification-stamp.png.
 */
@Service
public class CertifiedDocumentService {
    private static final float RELATIVE_WIDTH = 0.34f;
    private static final float MARGIN_FRACTION = 0.035f;
    private final Path storageDirectory = Paths.get("document-storage").toAbsolutePath().normalize();

    public record StampedDocument(String path, String fileName) {}

    public StampedDocument createStampedCopy(Document document, Long requestId, StampPosition position) {
        if (document == null || document.getFilePath() == null || position == null) {
            throw new IllegalArgumentException("Document and stamp position are required");
        }
        try {
            Path original = Paths.get(document.getFilePath()).toAbsolutePath().normalize();
            if (!original.startsWith(storageDirectory) || !Files.isRegularFile(original)) {
                throw new IllegalStateException("The original document is not available in storage");
            }
            String extension = extension(document.getOriginalFileName());
            String id = UUID.randomUUID().toString();
            if ("pdf".equals(extension)) {
                String name = "certified-request-" + requestId + "-" + id + ".pdf";
                Path target = storageDirectory.resolve(name).normalize();
                stampPdf(original, target, position);
                return new StampedDocument(target.toString(), name);
            }
            if ("jpg".equals(extension) || "jpeg".equals(extension) || "png".equals(extension)) {
                String name = "certified-request-" + requestId + "-" + id + ".png";
                Path target = storageDirectory.resolve(name).normalize();
                stampImage(original, target, position);
                return new StampedDocument(target.toString(), name);
            }
            throw new IllegalArgumentException("Only PDF, JPG and PNG documents can be certified");
        } catch (IOException e) {
            throw new IllegalStateException("Could not generate the stamped document", e);
        }
    }

    private void stampPdf(Path source, Path target, StampPosition position) throws IOException {
        byte[] stampBytes = loadStamp();
        try (PDDocument pdf = Loader.loadPDF(source.toFile())) {
            if (pdf.getNumberOfPages() == 0) throw new IllegalArgumentException("The PDF has no pages");
            PDImageXObject stamp = PDImageXObject.createFromByteArray(pdf, stampBytes, "mydocsrsa-stamp");
            for (PDPage page : pdf.getPages()) {
                float pageWidth = page.getMediaBox().getWidth();
                float pageHeight = page.getMediaBox().getHeight();
                float drawWidth = pageWidth * RELATIVE_WIDTH;
                float drawHeight = drawWidth * stamp.getHeight() / stamp.getWidth();
                float margin = pageWidth * MARGIN_FRACTION;
                float[] xy = position(pageWidth, pageHeight, drawWidth, drawHeight, margin, position);
                try (PDPageContentStream stream = new PDPageContentStream(pdf, page, AppendMode.APPEND, true, true)) {
                    stream.drawImage(stamp, xy[0], pageHeight - xy[1] - drawHeight, drawWidth, drawHeight);
                }
            }
            pdf.save(target.toFile());
        }
    }

    private void stampImage(Path source, Path target, StampPosition position) throws IOException {
        BufferedImage original = ImageIO.read(source.toFile());
        if (original == null) throw new IllegalArgumentException("The selected image is not a readable JPG or PNG");
        BufferedImage stamp = ImageIO.read(new java.io.ByteArrayInputStream(loadStamp()));
        if (stamp == null) throw new IllegalStateException("The MyDocs RSA stamp image could not be loaded");

        int drawWidth = Math.max(1, Math.round(original.getWidth() * RELATIVE_WIDTH));
        int drawHeight = Math.max(1, Math.round((float) drawWidth * stamp.getHeight() / stamp.getWidth()));
        int margin = Math.max(8, Math.round(original.getWidth() * MARGIN_FRACTION));
        float[] imagePosition = position(original.getWidth(), original.getHeight(), drawWidth, drawHeight, margin, position);
        int x = Math.round(imagePosition[0]);
        int y = Math.round(imagePosition[1]);

        BufferedImage output = new BufferedImage(original.getWidth(), original.getHeight(), BufferedImage.TYPE_INT_ARGB);
        Graphics2D g = output.createGraphics();
        try {
            g.setRenderingHint(RenderingHints.KEY_INTERPOLATION, RenderingHints.VALUE_INTERPOLATION_BICUBIC);
            g.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
            g.drawImage(original, 0, 0, null);
            g.setComposite(AlphaComposite.SrcOver);
            g.drawImage(stamp, x, y, drawWidth, drawHeight, null);
        } finally {
            g.dispose();
        }
        if (!ImageIO.write(output, "png", target.toFile())) {
            throw new IOException("No PNG image writer is available");
        }
    }

    private byte[] loadStamp() throws IOException {
        ClassPathResource resource = new ClassPathResource("static/mydocsrsa-certification-stamp.png");
        try (var in = resource.getInputStream()) {
            return in.readAllBytes();
        }
    }

    /** Returns x/top coordinates, keeping placement consistent across PDF and raster files. */
    private float[] position(float width, float height, float stampWidth, float stampHeight,
                             float margin, StampPosition position) {
        float x;
        float top;
        switch (position) {
            case TOP_LEFT -> { x = margin; top = margin; }
            case TOP_RIGHT -> { x = width - stampWidth - margin; top = margin; }
            case BOTTOM_LEFT -> { x = margin; top = height - stampHeight - margin; }
            case CENTER -> { x = (width - stampWidth) / 2f; top = (height - stampHeight) / 2f; }
            case BOTTOM_RIGHT -> { x = width - stampWidth - margin; top = height - stampHeight - margin; }
            default -> throw new IllegalArgumentException("Unsupported stamp position");
        }
        // Clamp for unusually short pages/images so the stamp stays on the canvas.
        x = Math.max(0, Math.min(x, width - stampWidth));
        top = Math.max(0, Math.min(top, height - stampHeight));
        return new float[] { x, top };
    }

    private String extension(String fileName) {
        if (fileName == null || !fileName.contains(".")) return "";
        return fileName.substring(fileName.lastIndexOf('.') + 1).toLowerCase(Locale.ROOT);
    }
}
