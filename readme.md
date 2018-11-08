# Devon Updater

This is a project that allows to keep Devonfw updated. 


## Installation

Download updater-v1.1.0.zip and extract it on your root Devonfw folder.

## Usage

On root folder, launch update.bat or run this command:

```bash
> updater.bat
```

Make sure you are on Devonfw root and the updater folder it's called "updater". 

Otherwise, go to the project folder and try this:

```bash
> npm install
```
Then go back to Devonfw root and execute this command:

```bash
> node [folder_name]\src\update.js
```
## Development

This project use typescript. To add funcionality open updater/src/update.ts and modify the file. 

To compile the project: 

```typescript
> tsc update.ts
```
To execute:

```typescript
> node update.js
```

To generate a package can use:

```typescript
> npm pack
```
