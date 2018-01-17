# remedy-ingestion-config-generator
This is a field mapping generator for Remedy Bulk Ingestion Script/plugin.

## Description

The Remedy plugin and Bulk ingestion scripts takes field mapping and configuration input as a JSON value.
So in order to make any changes in the field mapping, it becomes a little complex and error prone to copy the default json template, modify it correctly and then paste it back in the input template for Bulk Ingestion Script(in dist folder) or in plugin parameter configuration page.
The Html(index.html) facilitates the customization of field mapping using a UI. It loads the fields mapped by default and lets a user add/update/remove a field mapping in the UI.
It also has a jar file which will generate a json file containing all the fields available on a Remedy Server(making it easy to load and use all the custom fields on your Remedy server which are not available as part of default mapping).
This generated json file can be uploaded on the html ui and a user can make use of all the possible fields available on the Remedy Server.

## Developer

 Vivek Kumar Tiwari

## Reference Project Locations

```
 Plugin : https://github.com/boundary/meter-plugin-remedy
 Script : https://github.com/boundary/remedy-tsi-bulkingestion-script 
```

## How to use it ?
```
1) Clone/download the repository.
2) Go to /ui/configgenerator.
3) Open index.html in a browser.
```

## How to get all the fields and their mapping from a Remedy server?

1) Clone/download the repository on your local machine.
2) Open command prompt (cmd).
3) Move to target location of the repository.
4) Run jar file (java -jar remedyconfiggenerator-0.0.1-SNAPSHOT.jar <incident/change>) and follow the instructions.
5) This will fetch all the fields from the Remedy Server(for incident/change) and generate a Json file.
6) Navigate to the location /ui/configgenerator.
7) Open index.html in a web browser.
8) Select incidents/change and upload the corresponding generated file by clicking on the "Load Generated Template" button.
9) Click the "Load Configuration" button. This will load all the fields into the page and show you a UI with all the out of the bound fields.
10) You can add/remove/change properties mapped and copy the configuration Json to use it in plugin or Script
