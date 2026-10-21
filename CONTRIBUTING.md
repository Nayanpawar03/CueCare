# Contributing to CueCare

## Branching Model

| Branch              | Purpose                                        | Rules                                              |
|---------------------|------------------------------------------------|----------------------------------------------------|
| `main`              | Stable, production-ready code                  | No direct commits; updated only by merging develop |
| `develop`           | Integration of finished features               | No direct commits; updated through pull requests   |
| `feature/<name>`    | One new feature or task                        | Created from develop; merged back via pull request |
| `bugfix/<name>`     | One defect fix                                 | Created from develop; merged back via pull request |
| `release/<version>` | Release preparation                            | Created from develop; merged into main and develop |

### Naming Examples

- `feature/patient-registration`
- `feature/appointment-booking`
- `feature/slot-availability`
- `bugfix/fix-booking-validation`
- `release/v1.0.0`

---

## Pull Request Rules

- All changes reach `develop` through a pull request.
- A pull request must have a clear title, a description, and a link to its issue.
- Changes must be reviewed before merging.
- The branch is deleted after it is merged.

---

## Commit Message Rules

| Prefix    | Use                                          |
|-----------|----------------------------------------------|
| `feat:`   | A new feature                                |
| `fix:`    | A bug fix                                    |
| `docs:`   | Documentation only changes                   |
| `chore:`  | Setup, configuration, or dependency changes  |
| `test:`   | Adding or changing tests                     |
| `refactor:` | Code change without feature or fix         |
| `style:`  | Formatting changes only                      |

**Format:** `<prefix> short description in present tense`

**Examples:**
- `feat: add patient registration form`
- `fix: validate phone number input`
- `docs: update README with setup instructions`
- `chore: add Maven wrapper files`
