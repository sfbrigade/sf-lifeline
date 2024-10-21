# SF Life Line

SF Life Line (https://www.sanfranciscolifeline.com/) creates and distributes free communication tools to help bridge language barriers between patients and first responders in emergency medicine. This collaboration with SF Civic Tech (https://www.sfcivictech.org/) is building a complementary technology to augment those tools with a web-based app that can be accessed on any smartphone, tablet, or computer.

## Docker-based Development Setup

1. Install [Docker Desktop](https://docs.docker.com/desktop/).

2. Clone the repo to a directory on your computer.

3. Create a `.env` file in the `/server` directory with the values from the `.env.example` file.

4. In a command-line shell, navigate to the repo directory. Inside the root directory of this project, run `docker compose up`. It may take a few minutes to download and/or build the necessary images to run the codebase.

5. To run commands related to the codebase, you should first "log in" to the running server to execute them in the container so that you have access to installed dependencies. To do so, leave the server running in one shell, open another in the same repo directory, then run `docker compose exec server bash -l`. You can then execute commands like `npm install`, etc.

   Note that the configuration _does not share_ dependencies like `node_modules` between your host OS file system and the container to prevent mismatches (i.e. dependencies with native binaries that won't be the same inside the Linux-based container vs a Windows/Mac host).

6. If you're using VSCode as an editor, you can improve auto-completion and syntax highlighting by using the [Dev Containers](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers) extension to connect to the running container so it has access to installed dependencies. Once you attach to the running container, you can open the "remote folder" `/opt/node/app` which is where the code is located inside the container.

7. To stop the application, you can press CONTROL-C inside the shell where you ran `docker compose up`.

   If you've "logged in" to the server container using `docker compose exec server bash -l`, press CONTROL-D or type `exit` or `logout` to exit the container back to your host OS shell.

   If the application does not terminate gracefully after CONTROL-C (use `docker ps` to see running processes), run `docker compose stop` to terminate any running processes.

## Troubleshooting

- On macOS, if you're unable to start the server listening on port 5000, go to System Preferences, search for Airplay Receiver, and turn it off to release the port.

## Copyright

SF Life Line  
Copyright &copy; 2024 SF Civic Tech

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program. If not, see <https://www.gnu.org/licenses/>.
