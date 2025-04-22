package org.ssafy.tmt.api.repository.elastic;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.elasticsearch.repository.ElasticsearchRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import org.ssafy.tmt.api.dto.Elastic.ElasticUser;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserSearchRepository extends ElasticsearchRepository<ElasticUser, Integer> {
        Optional<ElasticUser> findById(int id);

        List<ElasticUser> findByEmailContainsIgnoreCase(String email);

        @Query("{\"bool\": { \"must\": [ \n" +
                "    {\"wildcard\": {\"email\": \"*?0*\"}}]}}")
        Page<ElasticUser> findByEmailContainsIgnoreCase(String email, Pageable pageable);

        // 정확하게 일치해야 검색되도록
        List<ElasticUser> findByEmailEqualsIgnoreCase(String email);
}
