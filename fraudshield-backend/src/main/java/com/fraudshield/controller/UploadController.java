package com.fraudshield.controller;

import com.fraudshield.dto.CsvUploadResponse;
import com.fraudshield.security.UserPrincipal;
import com.fraudshield.service.CsvUploadService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/upload")
public class UploadController {

    private final CsvUploadService csvUploadService;

    public UploadController(CsvUploadService csvUploadService) {
        this.csvUploadService = csvUploadService;
    }

    @PostMapping("/csv")
    public ResponseEntity<CsvUploadResponse> uploadCsv(
            @RequestParam("file") MultipartFile file,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        CsvUploadResponse response = csvUploadService.processCsv(file, userPrincipal.getId());
        return ResponseEntity.ok(response);
    }
}

