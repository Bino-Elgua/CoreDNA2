# Security Protocols

**Security guidelines and incident response procedures.**

---

## Access Control

### Repository Access

- Private GitHub repository
- Team members only (authorized list maintained by CTO)
- Contractors require NDA + time-limited access
- Regular access audits (quarterly)

### Production Access

- 2FA required for all team members
- SSH keys for git operations
- API tokens rotated quarterly
- VPN required for sensitive operations

---

## Development Security

### Environment Variables

- Never commit `.env.local` or `.env.production`
- Use `.env.example` for templates only
- Store production secrets in Vercel dashboard
- Use 1Password for team key sharing

### API Keys

- Use separate keys for dev/staging/prod
- Rotate keys quarterly
- Monitor usage for anomalies
- Revoke immediately if compromised

### Code Security

- No hardcoded secrets in code
- Use environment variables for all configs
- Signed commits required
- Dependabot alerts enabled

---

## Security Architecture

### Authentication

- Supabase Auth (magic link + OAuth)
- JWT tokens for API requests
- Row-level security (RLS) on all tables

### Data Isolation

- Each user can only access their own data
- RLS policies enforce `user_id = auth.uid()`
- Team data isolated by `team_id`

### API Key Management

- User API keys stored in localStorage (BYOK)
- CoreDNA keys stored in Vercel env vars
- Never exposed in client bundle

---

## Data Protection

### User Data

- Encrypted at rest (Supabase encryption)
- Encrypted in transit (HTTPS/TLS)
- Row-level security (RLS) enforced
- Regular backups (daily)

### PII Handling

- Minimal PII collection
- GDPR compliance (right to deletion)
- CCPA compliance (California users)
- Data retention policy (90 days for deleted accounts)

### Payment Data

- No credit card data stored in our database
- Stripe handles all payment processing
- PCI DSS compliance via Stripe

---

## Compliance

### Current Status

- [ ] SOC 2 Type II (in progress)
- [x] GDPR compliant
- [x] CCPA compliant
- [x] Encryption at rest
- [x] Encryption in transit

### Regular Audits

- **Security:** Quarterly external audit
- **Access:** Monthly team access review
- **Keys:** Quarterly rotation
- **Dependencies:** Weekly Dependabot checks

---

## Incident Response

### Contact Information

**Emergency Contacts:**

- CTO: [phone] (P0 only)
- DevOps: [phone] (P0-P1)
- Engineering Lead: [email/slack]

**Slack Channels:**

- `#incidents` — Real-time incident communication
- `#security` — Security discussions
- `#engineering` — General engineering

### Incident Response Process

1. **Detect** — Alert triggered or reported
2. **Assess** — Determine severity (P0-P3)
3. **Contain** — Stop the damage from spreading
4. **Investigate** — Root cause analysis
5. **Remediate** — Fix the issue
6. **Document** — Post-mortem report
7. **Prevent** — Implement safeguards

---

## Security Incident Classification

**P0 (Critical) — Immediate response required:**

- Data breach or unauthorized access
- Production service completely down
- Payment system compromised
- User data exposed

**P1 (High) — Response within 1 hour:**

- Partial service outage
- API keys potentially compromised
- Suspicious user activity detected

**P2 (Medium) — Response within 4 hours:**

- Performance degradation
- Minor security vulnerability discovered
- Failed login attempts spike

**P3 (Low) — Response within 24 hours:**

- Non-critical bug
- Documentation issue
- Feature request

---

## Data Protection Measures

### Encryption

- **In Transit:** TLS 1.3+ (HTTPS only)
- **At Rest:** AES-256 encryption (Supabase)
- **Database:** Encrypted backups

### Access Logging

- All API calls logged
- Failed login attempts tracked
- Admin actions audited
- Regular log review

### Secret Management

- All secrets in Vercel environment variables
- No secrets in Git history
- Automatic secret rotation enabled
- Audit logs for secret access

---

## Dependency Security

- Weekly Dependabot scans
- Automated security patches
- Manual review of major updates
- Pinned dependency versions for stability

---

## Breach Notification

If a security breach is discovered:

1. **Immediately** contact security@coredna.ai
2. **Assess** the scope and impact
3. **Contain** the breach
4. **Notify** affected users within 48 hours (GDPR requirement)
5. **Document** the incident
6. **Remediate** and prevent recurrence

---

## Security Checklist for Deployments

- [ ] All secrets removed from code
- [ ] `.env.local` not committed
- [ ] Dependency vulnerabilities scanned
- [ ] Code review completed by 2+ reviewers
- [ ] Database migrations tested in staging
- [ ] RLS policies reviewed and enforced
- [ ] API endpoints authenticated
- [ ] Rate limiting configured
- [ ] Error messages don't expose internals
- [ ] Logging configured (no PII in logs)

---

## Questions?

**Security Issue?** Contact security@coredna.ai immediately.

For general security questions: engineering@coredna.ai
