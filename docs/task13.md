# Task 13: Configuration Management with Ansible

## Objective and Scope

Use Ansible to configure a Linux node for the CueCare API. The playbook installs runtime packages, creates a restricted service account and required directories, deploys the API files and configuration, allows the API port, and enables the API as a systemd service.

## Configuration Specification

| Category | Requirement | Configuration |
|---|---|---|
| Operating system | Ubuntu/Debian Linux with systemd | Ansible inventory targets the Ubuntu WSL node locally. |
| Runtime | Node.js 18+ and npm | `nodejs`, `npm` packages; the playbook asserts Node.js 18 or newer. |
| Native modules | C/C++ toolchain, Python, SQLite development headers | `build-essential`, `python3`, `sqlite3`, `libsqlite3-dev`. |
| Service account | Restricted system account | `cuecare` group and `cuecare` user with `/usr/sbin/nologin`. |
| Application files | API source and npm manifests | `/opt/cuecare/server/`. |
| Configuration | Runtime environment file | `/etc/cuecare/cuecare.env`, mode `0640`. |
| Database | SQLite database | `/var/lib/cuecare/cuecare.db`, owned by `cuecare`. |
| Logs | systemd journal and prepared log directory | `/var/log/cuecare/`; service stdout/stderr go to journald. |
| API port | TCP 5000 | Configured by environment file and allowed in UFW. |
| Service | CueCare API | `cuecare-api.service`, enabled and started with systemd. |

The Ansible inventory is `ansible/inventory.ini`; the playbook is `ansible/playbook.yml`. The service and environment templates are stored under `ansible/templates/`.

## Target and Prerequisites

The target is the Ubuntu WSL distribution. Docker Desktop's internal `docker-desktop` distribution is not used as an application server. Install a separate Ubuntu distribution from an elevated PowerShell window:

```powershell
wsl --install -d Ubuntu
```

Complete the Ubuntu first-run username/password setup. In Ubuntu, enable systemd by adding this to `/etc/wsl.conf` while preserving any existing settings:

```ini
[boot]
systemd=true
```

Then run `wsl --shutdown` from Windows PowerShell and reopen Ubuntu. Install Ansible in Ubuntu:

```bash
sudo apt update
sudo apt install -y ansible
```

## First Execution

From the repository's WSL path, run:

```bash
cd "/mnt/c/Users/Nayan/Music/Devops Project/CueCare/ansible"
ansible-playbook -i inventory.ini playbook.yml --ask-become-pass
```

Enter the Ubuntu user's sudo password when prompted. The successful execution log should report package installation, `cuecare-api` enabled and started, and the `/health` request returning `UP`.

The initial run completed on 25 October 2026. Ansible asserted a systemd-based Debian-family target, installed the prerequisites, created the service account and directories, copied the API files, configured the environment and systemd unit, added the UFW rule, and started the API service.

```text
PLAY [Configure the CueCare API node]
TASK [Require a systemd based Ubuntu target] ................. ok
TASK [Install CueCare runtime and native build prerequisites] changed
TASK [Create the CueCare service group] ..................... changed
TASK [Create the restricted CueCare service account] ........ changed
TASK [Create application, configuration, database, and log directories] changed
TASK [Copy CueCare API source] .............................. changed
TASK [Copy API package manifest] ............................ changed
TASK [Copy API package lock] ................................. changed
RUNNING HANDLER [Install production dependencies] .......... changed
TASK [Configure CueCare API environment] .................... changed
TASK [Install the CueCare systemd service unit] ............. changed
TASK [Allow the CueCare API port through UFW] ............... changed
TASK [Enable and start CueCare API] ......................... changed
RUNNING HANDLER [Restart CueCare API] ...................... changed
TASK [Wait for CueCare API health endpoint] ................. ok

PLAY RECAP
cuecare-wsl : ok=18 changed=13 unreachable=0 failed=0 skipped=0 rescued=0 ignored=0
```

The installed Node.js version is `v22.22.1`. `cuecare-api.service` is enabled and active. The health endpoint returned `{"status":"UP","application":"CueCare","version":"1.0.0"}` both inside Ubuntu and from Windows at `http://127.0.0.1:5000/health`. UFW contains the `5000/tcp` allow rule; UFW itself remains inactive in WSL.

**[Insert Screenshot 1 here: Ubuntu terminal showing the Ansible play recap with `ok=18`, `changed=13`, and `failed=0`.]**

**[Insert Screenshot 2 here: Ubuntu terminal showing `systemctl status cuecare-api` as active and `curl http://127.0.0.1:5000/health` returning `UP`.]**

## Deliverables

- Configuration specification covering packages, users, folders, files, ports, and services.
- Ansible inventory and YAML playbook for the Ubuntu target node.
- First execution recap (`ok=18`, `changed=13`, `failed=0`) and verified service/health endpoint.
- Screenshots of the Ansible execution and active service for the assignment report.
