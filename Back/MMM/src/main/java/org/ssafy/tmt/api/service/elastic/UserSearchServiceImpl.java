package org.ssafy.tmt.api.service.elastic;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.elasticsearch.core.ElasticsearchOperations;
import org.springframework.stereotype.Service;
import org.ssafy.tmt.api.dto.Elastic.ElasticUser;
import org.ssafy.tmt.api.dto.Elastic.User;
import org.ssafy.tmt.api.repository.elastic.UserSearchRepository;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserSearchServiceImpl implements UserSearchService {

    private final ElasticsearchOperations elasticsearchOperations;
    private final UserSearchRepository userSearchRepository;

    public void save(User user) {

        elasticsearchOperations.save(ElasticUser.from(user));

    }

//    public List<MemberDto> searchAddableMembers(String keyword, Member member) {
//        return memberSearchRepository.findByNicknameContainsIgnoreCase(keyword).stream()
//                .filter(memberDocument -> !Objects.equals(memberDocument.getId(), member.getId()))
//                .map(MemberDto::of)
//                .collect(Collectors.toList());
//    }

}
