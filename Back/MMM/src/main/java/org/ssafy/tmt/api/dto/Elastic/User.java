package org.ssafy.tmt.api.dto.Elastic;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    private int id;

    private String name;

    private String email;
}
