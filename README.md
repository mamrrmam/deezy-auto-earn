# deezy-auto-earn
automatically open channels to deezy, push sats through, and earn

## setup
```
git clone git@github.com:dannydeezy/deezy-auto-earn.git
cd deezy-auto-earn
cp sample-config.json config.json
npm i
```

## run once
```
node index.js
```

## run continously (recommended)
it is recommended to run this as a systemd service.

note you may want to make the following edits to the `deezy-auto-earn-example.service` file:
- change username from `ubuntu` to your user
- update `RestartSec` to your desired interval, which will determine how frequently the script runs

```
sudo cp deezy-auto-earn-example.service /etc/systemd/system/deezy-auto-earn.service
sudo systemctl enable deezy-auto-earn.service
sudo systemctl start
```
to follow the logs:
```
journalctl -fu deezy-auto-earn -n 100
```
