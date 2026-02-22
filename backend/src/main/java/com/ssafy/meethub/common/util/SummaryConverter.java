package com.ssafy.meethub.common.util;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.ssafy.meethub.common.exception.BusinessException;
import com.ssafy.meethub.common.exception.CommonErrorCode;
import com.ssafy.meethub.report.vo.Summary;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@Converter(autoApply = false)
public class SummaryConverter implements AttributeConverter<Summary, String> {

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public String convertToDatabaseColumn(Summary summary) {
        if (summary == null) {
            return null;
        }
        try {
            return objectMapper.writeValueAsString(summary);
        } catch (JsonProcessingException e) {
            log.error("Summary 변환 실패: {}", summary, e);
            throw new BusinessException(CommonErrorCode.INTERNAL_SERVER_ERROR);
        }
    }

    @Override
    public Summary convertToEntityAttribute(String dbData) {
        if (dbData == null || dbData.isEmpty()) {
            return null;
        }
        try {
            return objectMapper.readValue(dbData, Summary.class);
        } catch (JsonProcessingException e) {
            log.error("Summary 역변환 실패: {}", dbData, e);
            throw new BusinessException(CommonErrorCode.INTERNAL_SERVER_ERROR);
        }
    }
}
