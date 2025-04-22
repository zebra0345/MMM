package org.ssafy.tmt.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.ssafy.tmt.util.MessageUtil;
import org.ssafy.tmt.util.Response;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(UnauthorizedException.class)
    public ResponseEntity<Object> handleUnauthorizedException(UnauthorizedException ex) {
        return Response.Response(HttpStatus.UNAUTHORIZED, MessageUtil.buildMessage(ex.getMessage()));
    }

    @ExceptionHandler(NoSpendingAccountException.class)
    public ResponseEntity<Object> handleNoSpendingAccountException(NoSpendingAccountException ex) {
        return Response.Response(HttpStatus.NOT_FOUND, MessageUtil.buildMessage(ex.getMessage()));
    }
}
