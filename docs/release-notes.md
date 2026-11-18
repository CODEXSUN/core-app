# core-app tagged release

The matching docs/CHANGELOG.md records product changes. Builds use published, immutable sibling pins; application secrets and runtime data are excluded. CodeShip owns installation, migration planning, checked recovery backups when migrations are pending, image replacement and verification. Product shell entries delegate to CodeShip.

An image release is not an installation certificate. Installation requires the reviewed core-app runtime/database adapter and Platform service/tenant registration; unsupported targets stop before changes. Never bypass authentication, reset data or reuse another app's database to make readiness pass.
