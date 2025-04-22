package org.ssafy.tmt.api.dto.Elastic;

import jakarta.persistence.Id;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.springframework.data.elasticsearch.annotations.Document;

@Builder
@Getter
@AllArgsConstructor
@NoArgsConstructor
@Document(indexName = "user")
public class ElasticUser {

    @Id
    private int id;

    private String name;

    private String email;

    public static ElasticUser from(User users) {
        return ElasticUser.builder()
                .id(users.getId())
                .name(users.getName())
                .email(users.getEmail())
                .build();
    }
}
