# HEXLY DEV STARTER KIT
## Install Ubuntu
- [Ubuntu Download](https://www.ubuntu.com/download/desktop)

- [Installation Guide](https://tutorials.ubuntu.com/tutorial/tutorial-install-ubuntu-desktop?_ga=2.101491393.194245149.1544678104-1442482115.1544508832#0)
## Install Docker CE
- [Install Guide](https://docs.docker.com/install/linux/docker-ce/ubuntu/#install-docker-ce)
## Install DB Visualizer
- [DEB package](http://www.dbvis.com/product_download/dbvis-10.0.16/media/dbvis_linux_10_0_16.deb)

## Install Node / NPM
    curl -sL https://deb.nodesource.com/setup_11.x | sudo -E bash -
    sudo apt-get install -y nodejs
## Install Flyway
Install Brew

    sh -c "$(curl -fsSL https://raw.githubusercontent.com/Linuxbrew/install/master/install.sh)"

Then the following to add Brew to bash profile

    test -d ~/.linuxbrew && eval $(~/.linuxbrew/bin/brew shellenv)
    test -d /home/linuxbrew/.linuxbrew && eval $(/home/linuxbrew/.linuxbrew/bin/brew shellenv)
    test -r ~/.bash_profile && echo "eval \$($(brew --prefix)/bin/brew shellenv)" >>~/.bash_profile
    echo "eval \$($(brew --prefix)/bin/brew shellenv)" >>~/.profile

Use Brew to install Flyway

    brew install flyway

## Clone the GitHub repos

### Create SSH key

- Follow this [guide](https://help.github.com/articles/generating-a-new-ssh-key-and-adding-it-to-the-ssh-agent/)

### Add key to GitHub account
- In the shell enter  

        cat <YOUR SSH KEY FILENAME>.pub

- Copy the output (It should start with 'ssh-rsa' and end with the email address you entered)

- Go to the keys section of GitHub settings - [GitHub keys](https://github.com/settings/keys)
- Click the green 'New SSH key' button
- Enter in a title
- Paste the key into the text field and click 'Add SSH key'

### Clone Admin, Platform and Backoffice
- In the terminal, navigate to a directory of your choice then enter the following

        git clone git@github.com:hexly/admin.git

- Repeat this replacing 'admin.git' with 'platform.git' and 'backoffice.git' respectively
- Change to /platform and run 

        npm install
        npm run start

- Repeat this for /backoffice

## Create .env file in /backoffice
- In a terminal run

        docker exec -i platform_db_1 psql -h localhost -U dbadmin -p 5432 \
        --dbname system <<EOF
        select
        i.id as identity_id,
        i.tenant_id,
        ic.id as credential_id,
        ic.username as credential_username,
        m.id as member_id,
        m.mrn,
        m.slug,
        m.name
        from iam.identity i
        left join iam.identity_member im on im.identity_id = i.id
        left join membership.member m on m.id = im.member_id
        left join iam.identity_credential ic on ic.identity_id = i.id
        order by random()
        limit 1
        EOF
- Open /backoffice/.env and add the following and save

        VUE_APP_LANE=dev
        VUE_APP_TENANT_ID= <tenant_id from the previous console output>
        VUE_APP_API_ENDPOINT=http://localhost:3000
        VUE_APP_GRAPHQL_ENDPOINT=http://localhost:3000


## Run 'up' and 'nuke'
    npm run local:up
    npm run local:nuke
