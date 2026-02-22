package com.ssafy.meethub.user.dto.request;

import jakarta.validation.constraints.NotNull;
import java.util.List;

public record RelocateItemsRequest(
        @NotNull(message = "옮기려는 폴더가 존재해야 합니다.")
        Long targetId,

        @NotNull(message = "폴더 이동 정보가 null일 수 없습니다.")
        List<Long> folderRelocationInfos,

        @NotNull(message = "파일 이동 정보가 null일 수 없습니다.")
        List<Long> fileRelocationInfos
) {
}
