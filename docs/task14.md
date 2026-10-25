# Task 14: Automated Provisioning and Reliability Validation

## Objective and Scope

Use Ansible to provision a clean, isolated CueCare deployment root on the Ubuntu WSL target, deploy a stable API release, rerun the automation to demonstrate idempotency, verify application health, and test recovery from an unhealthy candidate release.

The existing Task 13 API remains separate on port `5000`. Task 14 uses its own service account, configuration, data/log directories, release tree, and port `5003`.

## Provisioned Target

| Resource | Configuration |
|---|---|
| Target node | Ubuntu WSL with systemd, inventory host `cuecare-wsl` |
| Service account/group | `cuecare14` |
| Application root | `/opt/cuecare-task14/` |
| Stable release | `/opt/cuecare-task14/releases/stable-1/` |
| Current release pointer | `/opt/cuecare-task14/current` symlinks to the active release |
| Runtime configuration | `/etc/cuecare-task14/cuecare.env` |
| SQLite data | `/var/lib/cuecare-task14/cuecare.db` |
| Logs | `/var/log/cuecare-task14/` and systemd journal |
| API port | TCP `5003`; UFW allow rule added |
| Service | `cuecare-task14-api.service`, enabled and active |

The Task 14 provisioner is `ansible/task14-provision.yml`. The rollback demonstration is `ansible/task14-rollback.yml`. The rollback playbook switches to a deliberately broken candidate entry point, detects the failed health check, and restores the previous stable release.

## Initial Provisioning and Health Check

Run from the Ubuntu WSL terminal:

```bash
cd "/mnt/c/Users/Nayan/Music/Devops Project/CueCare/ansible"
ansible-playbook -i inventory.ini task14-provision.yml
```

The first successful provisioning run completed with:

```text
PLAY RECAP
cuecare-wsl : ok=17 changed=7 unreachable=0 failed=0 skipped=0 rescued=0 ignored=0
```

The stable release was installed and the API health endpoint returned `{"status":"UP","application":"CueCare","version":"1.0.0"}` at `http://127.0.0.1:5003/health`.

## Idempotency Run

The same playbook was run a second time without changing its inputs:

```bash
ansible-playbook -i inventory.ini task14-provision.yml
```

The second run made no changes and completed successfully:

```text
PLAY RECAP
cuecare-wsl : ok=17 changed=0 unreachable=0 failed=0 skipped=0 rescued=0 ignored=0
```

## Rollback and Recovery

The rollback playbook was executed:

```bash
ansible-playbook -i inventory.ini task14-rollback.yml
```

It switched `current` to candidate `rollback-test`, whose entry point intentionally throws an error. The health request failed with connection refused. Ansible then ran its rescue tasks: it repointed `current` to `stable-1`, restarted `cuecare-task14-api`, and verified health.

```text
Candidate rollback-test failed health; current was restored to
/opt/cuecare-task14/releases/stable-1 and the API is UP.

PLAY RECAP
cuecare-wsl : ok=12 changed=6 unreachable=0 failed=0 skipped=0 rescued=1 ignored=0
```

After recovery, `cuecare-task14-api.service` was enabled and active, `current` resolved to `/opt/cuecare-task14/releases/stable-1`, and both Ubuntu and Windows received `UP` from `http://127.0.0.1:5003/health`.

## Evidence Screenshots

**[Insert Screenshot 1 here: Ansible provisioning and second-run recap showing `changed=0` and `failed=0`.]**

**[Insert Screenshot 2 here: Rollback run showing the candidate health failure, rescue to `stable-1`, and final `rescued=1`, `failed=0` recap.]**

**[Insert Screenshot 3 here: Ubuntu terminal showing `systemctl status cuecare-task14-api`, the current release symlink, and the health endpoint returning `UP`.]**

## Deliverables

- Provisioned isolated CueCare target service and stable release.
- Idempotency evidence from a second Ansible run with `changed=0`.
- Health check result from Ubuntu WSL and the Windows host.
- Automated rollback/recovery evidence restoring `stable-1` after an unhealthy candidate.
