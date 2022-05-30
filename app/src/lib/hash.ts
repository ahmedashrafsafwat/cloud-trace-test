import crypto from 'crypto';

export default function hash(val) {
  const hash = crypto.createHash('sha256');
  hash.update(val);
  return hash.digest('hex');
}
