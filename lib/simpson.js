exports.createSimpsonInitialModel = function () {
    return {
      "uuid": "d229e52c-4e18-4261-9144-de8dc7f5b007",
      "label": "Simpson",
      "lastname": "Simpson",
      "address": "742 Evergreen Terrace",
      "members": [
        {
          "uuid": "cdb9eb06-4c13-492b-9262-19c2ae7a6f33",
          "label": "Homer",
          "firstname": "Homer",
          "age": "49",
          "job": "Nuclear Safety Inspector",
          "catchphrase": "D'Oh!",
          "spouse": "6720a6c4-eedc-4b0c-babc-69f835c20568"
        },
        {
            "uuid": "6720a6c4-eedc-4b0c-babc-69f835c20568",
            "firstname": "Marge",
            "label": "Marge",
            "age": "43",
            "job": "Housewife"
        },
        {
          "uuid": "8d4ef25f-24d0-432c-9b77-61270c868a93",
          "label": "Bart",
          "firstname": "Bart",
          "age": "12",
          "tool": "slingshot"
        }
      ]
    };
    return {
      "uuid": "d229e52c-4e18-4261-9144-de8dc7f5b007",
      "lastname": "Simpson",
      "address": "742 Evergreen Terrace",
      "members": [
        {
          "uuid": "cdb9eb06-4c13-492b-9262-19c2ae7a6f33",
          "label": "Homer",
          "firstname": "Homer",
          "age": "49",
          "job": "Nuclear Safety Inspector",
          "catchphrase": "D'Oh!",
          "spouse": {
            "uuid": "6720a6c4-eedc-4b0c-babc-69f835c20568",
            "firstname": "Marge",
            "label": "Marge",
            "age": "43",
            "job": "Housewife"
          }
        },
        "6720a6c4-eedc-4b0c-babc-69f835c20568",
        {
          "uuid": "8d4ef25f-24d0-432c-9b77-61270c868a93",
          "label": "Bart",
          "firstname": "Bart",
          "age": "12",
          "tool": "slingshot"
        }
      ]
    };
}

exports.createSimpsonInitialDiagram = function () {
    return {
      "objects": [
        {
          "uuid": "2d867140-6794-4056-8b4a-d02c51b5ad1d",
          "model": "cdb9eb06-4c13-492b-9262-19c2ae7a6f33",
          "type": "individual",
          "left": 100,
          "top": 50,
          "width": 200,
          "height": 160,
          "incomings": [],
          "outgoings": [
            "a95c6f96-1040-470b-9445-68c071ef3fad"
          ]
        },
        {
          "uuid": "f0d00793-7b15-4cb1-8be5-c09437f66ba2",
          "model": "6720a6c4-eedc-4b0c-babc-69f835c20568",
          "type": "individual",
          "left": 600,
          "top": 70,
          "width": 200,
          "height": 160,
          "incomings": [
            "a95c6f96-1040-470b-9445-68c071ef3fad"
          ],
          "outgoings": []
        },
        {
          "uuid": "4bcaed30-98b2-47d1-b4ec-b97f94575b65",
          "model": "8d4ef25f-24d0-432c-9b77-61270c868a93",
          "type": "individual",
          "left": 350,
          "top": 250,
          "width": 200,
          "height": 160,
          "incomings": [],
          "outgoings": []
        },
        {
          "uuid": "a95c6f96-1040-470b-9445-68c071ef3fad",
          "model": null,
          "type": "relation",
          "left": 300,
          "top": 133.2,
          "width": 300,
          "height": 13.61,
          "relation": "spouse",
          "source": "2d867140-6794-4056-8b4a-d02c51b5ad1d",
          "target": "f0d00793-7b15-4cb1-8be5-c09437f66ba2"
        }
      ],
      "background": "white",
      "model": "d229e52c-4e18-4261-9144-de8dc7f5b007"
    };
}

