package org.ssafy.tmt.api.service.account;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.ssafy.tmt.api.entity.account.AccountVerify;
import org.ssafy.tmt.api.entity.account.Accounts;
import org.ssafy.tmt.api.dto.account.AccountsBankAndNumber;
import org.ssafy.tmt.api.dto.account.AccountsRead;
import org.ssafy.tmt.api.entity.transaction.VerifyTransaction;
import org.ssafy.tmt.api.entity.user.Users;
import org.ssafy.tmt.api.repository.accounts.AccountVerifyRepository;
import org.ssafy.tmt.api.repository.accounts.AccountsRepository;
import org.ssafy.tmt.api.repository.users.UsersRepository;
import org.ssafy.tmt.api.repository.transaction.VerifyTransactionRepository;
import org.ssafy.tmt.config.security.CustomUserDetails;
import org.ssafy.tmt.db.mapper.transaction.AccountMapper;
import org.ssafy.tmt.util.AccountsUtil;
import org.ssafy.tmt.util.GenerateRandomDigit;
import org.ssafy.tmt.util.MessageUtil;
import org.ssafy.tmt.util.Response;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class AccountServiceImpl implements AccountService {

	private final AccountMapper accountMapper;
	private final VerifyTransactionRepository verifyTransactionRepository;
	private final AccountVerifyRepository accountVerifyRepository;
	private final AccountsUtil accountsUtil;
	private final AccountsRepository accountsRepository;
	private final UsersRepository usersRepository;

	@Override
	@Transactional
	public ResponseEntity<Object> accountVerifyRequest(String accountNumber) {
		return accountsRepository.findByAccountNumber(accountNumber)
				.map(account -> {
					String verifyNumber = GenerateRandomDigit.sixDigit();

					VerifyTransaction verifyTransaction = VerifyTransaction.builder()
							.account(account)
							.verifyNumber(verifyNumber)
							.amount(1) // 필요에 따라 상수로 분리할 수 있습니다.
							.build();

					verifyTransactionRepository.save(verifyTransaction);

					accountsUtil.updateAccountBalance(account, account.getBalance() + verifyTransaction.getAmount());

					return Response.Response(
							HttpStatus.OK,
							MessageUtil.buildMessage("success")
					);
				})
				.orElseGet(() ->
						Response.Response(
								HttpStatus.NOT_FOUND,
								MessageUtil.buildMessage("해당하는 계좌가 없습니다.")
						)
				);
	}

	@Override
	@Transactional
	public ResponseEntity<Object> accountVerifyResponse(String accountNumber, String verifyNumber) {
		Optional<Accounts> accounts = accountsRepository.findByAccountNumber(accountNumber);
		if (accounts.isEmpty()) {
			return Response.Response(HttpStatus.NOT_FOUND,
					MessageUtil.buildMessage("해당하는 계좌가 없습니다.")
			);
		}

		return verifyTransactionRepository.findByAccountAndVerifyNumber(accounts.get(), verifyNumber)
				.map(verifyTransaction -> {
					return Response.Response(
							HttpStatus.OK,
							MessageUtil.buildMessage("success")
					);
				})
				.orElseGet(() -> Response.Response(
						HttpStatus.NOT_FOUND,
						MessageUtil.buildMessage("인증번호가 틀렸습니다.")
						)
				);
	}

	@Override
	@Transactional
	public ResponseEntity<Object> getAccounts(CustomUserDetails customUserDetails) {
		Optional<Users> user = usersRepository.findById(customUserDetails.getId());
		if (user.isEmpty()) {
			return Response.Response(HttpStatus.NOT_FOUND, MessageUtil.buildMessage("아이디가 없습니다."));
		}
		List<AccountsBankAndNumber> accounts = accountsRepository.findAccountsBankAndNumberByUser(user.get());
		if (accounts.isEmpty()) {
			return Response.Response(HttpStatus.NOT_FOUND, MessageUtil.buildMessage("계좌가 없습니다."));
		}

		AccountsRead accountsRead = AccountsRead.builder()
				.accounts(accounts)
				.message("success")
				.build();

		return Response.Response(HttpStatus.OK, accountsRead);
	}

	@Override
	@Transactional
	public ResponseEntity<Object> registerAccount(CustomUserDetails customUserDetails) {
		Optional<Users> user = usersRepository.findById(customUserDetails.getId());
		if (user.isEmpty()) {
			return Response.Response(HttpStatus.NOT_FOUND, MessageUtil.buildMessage("아이디가 없습니다."));
		}
		List<Accounts> accounts = accountsRepository.findByUser(user.get());
		if (accounts.isEmpty()) {
			return Response.Response(HttpStatus.NOT_FOUND, MessageUtil.buildMessage("계좌가 없습니다."));
		}

		for (Accounts account : accounts) {
			if (accountVerifyRepository.existsByAccount(account)) {
				continue;
			}
			AccountVerify accountVerify = AccountVerify.builder()
					.account(account)
					.verify(true)
					.build();
			accountVerifyRepository.save(accountVerify);
		}

		return Response.Response(HttpStatus.OK, MessageUtil.buildMessage("success"));
	}
}
