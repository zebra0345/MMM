package org.ssafy.tmt.config.security;

import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.ssafy.tmt.api.entity.user.Users;
import org.ssafy.tmt.api.repository.users.UsersRepository;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    private final UsersRepository usersRepository;

    public CustomUserDetailsService(UsersRepository usersRepository) {
        this.usersRepository = usersRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        // 이메일을 사용하여 사용자 정보 조회
        Users user = usersRepository.findByEmail(email) // 이메일로 사용자를 찾는 메서드 추가
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));

        System.out.println(user.getEmail());
        System.out.println("로그인 시도: " + email);

        // CustomUserDetails 객체 생성 후 반환
        return new CustomUserDetails(user.getId(), user.getName(), user.getEmail(), user.getPassword());
    }
}
