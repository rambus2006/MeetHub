package com.ssafy.meethub.common.log;

import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.stereotype.Component;

import lombok.extern.slf4j.Slf4j;

@Aspect
@Component
@Slf4j
public class LoggingAspect {

    private static final String CONTROLLER_POINTCUT = "execution(* com.ssafy.meethub.*.controller.*.*(..))";
    private static final String SERVICE_POINTCUT = "execution(* com.ssafy.meethub.*.service.*.*(..))";

    @Around(CONTROLLER_POINTCUT)
    public Object logApiRequest(ProceedingJoinPoint joinPoint) throws Throwable {
        ExecutionTimer timer = new ExecutionTimer();
        ApiRequestInfo requestInfo = ApiRequestInfo.from(joinPoint);

        log.info("API Request: {} {} started", requestInfo.httpMethod(), requestInfo.endpoint());

        try {
            Object result = joinPoint.proceed();
            logSuccessfulApiResponse(requestInfo, timer.getElapsedTime());
            return result;
        } catch (Exception e) {
            logFailedApiResponse(requestInfo, timer.getElapsedTime(), e);
            throw e;
        }
    }

    @Around(SERVICE_POINTCUT)
    public Object logService(ProceedingJoinPoint joinPoint) throws Throwable {
        ExecutionTimer timer = new ExecutionTimer();
        ServiceInfo serviceInfo = ServiceInfo.from(joinPoint);

        log.debug("Service Start: {}.{}", serviceInfo.className(), serviceInfo.methodName());

        try {
            Object result = joinPoint.proceed();
            logSuccessfulServiceExecution(serviceInfo, timer.getElapsedTime());
            return result;
        } catch (Exception e) {
            logFailedServiceExecution(serviceInfo, timer.getElapsedTime(), e);
            throw e;
        }
    }

    private void logSuccessfulApiResponse(ApiRequestInfo requestInfo, long executionTime) {
        log.info("API Response: {} {} completed in {}ms",
                requestInfo.httpMethod(),
                requestInfo.endpoint(),
                executionTime);
    }

    private void logFailedApiResponse(ApiRequestInfo requestInfo, long executionTime, Exception exception) {
        log.error("API Error: {} {} failed after {}ms - {}",
                requestInfo.httpMethod(),
                requestInfo.endpoint(),
                executionTime,
                exception.getMessage());
    }

    private void logSuccessfulServiceExecution(ServiceInfo serviceInfo, long executionTime) {
        log.debug("Service End: {}.{} executed in {}ms",
                serviceInfo.className(),
                serviceInfo.methodName(),
                executionTime);
    }

    private void logFailedServiceExecution(ServiceInfo serviceInfo, long executionTime, Exception exception) {
        log.error("Service Error: {}.{} failed after {}ms - {}",
                serviceInfo.className(),
                serviceInfo.methodName(),
                executionTime,
                exception.getMessage(),
                exception);
    }

    private static class ExecutionTimer {
        private final long startTime;

        public ExecutionTimer() {
            this.startTime = System.currentTimeMillis();
        }

        public long getElapsedTime() {
            return System.currentTimeMillis() - startTime;
        }
    }

    private record ApiRequestInfo(String httpMethod, String endpoint) {

        public static ApiRequestInfo from(ProceedingJoinPoint joinPoint) {
                String methodName = joinPoint.getSignature().getName();
                String className = joinPoint.getTarget().getClass().getSimpleName();
                String httpMethod = HttpMethodExtractor.extract(methodName);
                String endpoint = EndpointBuilder.build(className, methodName);

                return new ApiRequestInfo(httpMethod, endpoint);
            }
        }

    private record ServiceInfo(String className, String methodName) {

        public static ServiceInfo from(ProceedingJoinPoint joinPoint) {
                String className = joinPoint.getTarget().getClass().getSimpleName();
                String methodName = joinPoint.getSignature().getName();

                return new ServiceInfo(className, methodName);
            }
        }

    private static class HttpMethodExtractor {
        private static final String POST = "POST";
        private static final String PUT = "PUT";
        private static final String DELETE = "DELETE";
        private static final String GET = "GET";

        public static String extract(String methodName) {
            if (isPostMethod(methodName)) {
                return POST;
            }
            if (isPutMethod(methodName)) {
                return PUT;
            }
            if (isDeleteMethod(methodName)) {
                return DELETE;
            }
            return GET;
        }

        private static boolean isPostMethod(String methodName) {
            return methodName.contains("create")
                    || methodName.contains("signup")
                    || methodName.contains("signin");
        }

        private static boolean isPutMethod(String methodName) {
            return methodName.contains("update") || methodName.contains("modify");
        }

        private static boolean isDeleteMethod(String methodName) {
            return methodName.contains("delete");
        }
    }

    private static class EndpointBuilder {
        private static final String API_PREFIX = "/api/";
        private static final String CONTROLLER_SUFFIX = "Controller";
        private static final String PATH_DELIMITER = "/";

        public static String build(String className, String methodName) {
            String domain = extractDomain(className);
            return API_PREFIX + domain + PATH_DELIMITER + methodName;
        }

        private static String extractDomain(String className) {
            return className.replace(CONTROLLER_SUFFIX, "").toLowerCase();
        }
    }
}
