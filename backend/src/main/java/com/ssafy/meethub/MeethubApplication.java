package com.ssafy.meethub;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@SpringBootApplication
@EnableJpaAuditing
public class MeethubApplication {

    public static void main(String[] args) {
        SpringApplication.run(MeethubApplication.class, args);
    }
}
