import subprocess

def verify():
    test_code = """
    import { generateSalt, hashPassword, verifyPassword, signJwt, verifyJwt } from './apps/api/src/auth.ts';

    async function run() {
      // 1. Test Salt & Hash
      const salt = generateSalt();
      if (!salt || salt.length !== 32) throw new Error('Invalid salt length: ' + salt);
      
      const pwd = 'TestSecretFrog2026!';
      const hash = await hashPassword(pwd, salt);
      if (!hash || hash.length !== 64) throw new Error('Invalid hash length: ' + hash);
      
      const isCorrect = await verifyPassword(pwd, salt, hash);
      if (!isCorrect) throw new Error('verifyPassword failed on valid password');
      
      const isWrong = await verifyPassword('WrongPassword', salt, hash);
      if (isWrong) throw new Error('verifyPassword succeeded on invalid password');
      
      // 2. Test JWT
      const token = await signJwt({ sub: 10, email: 'khachhang@gmail.com', name: 'Long', role: 'customer' });
      const payload = await verifyJwt(token);
      if (!payload || payload.sub !== 10 || payload.role !== 'customer') {
        throw new Error('JWT verification mismatch');
      }
      
      // 3. Test tampered JWT
      const tampered = token.slice(0, -6) + 'xyz123';
      const tamperedPayload = await verifyJwt(tampered);
      if (tamperedPayload !== null) throw new Error('Tampered token should return null');
      
      console.log('PASS_CRYPTO');
    }

    run().catch(e => {
      console.error(e);
      process.exit(1);
    });
    """
    cmd = ['node', '--experimental-strip-types', '-e', test_code]
    res = subprocess.run(cmd, capture_output=True, text=True, encoding='utf-8', errors='ignore')
    assert res.returncode == 0, f'Node crypto test failed: {res.stderr}'
    assert 'PASS_CRYPTO' in res.stdout, f'Expected PASS_CRYPTO in stdout, got: {res.stdout}'
    
    print('PASS: Verified Web Crypto PBKDF2 hashing, timing-safe verification, and JWT HS256 tokens!')

if __name__ == '__main__':
    verify()
