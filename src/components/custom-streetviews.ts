// Copyright (c) 2024 Streetlives, Inc.
//
// Use of this source code is governed by an MIT-style
// license that can be found in the LICENSE file or at
// https://opensource.org/licenses/MIT.

const customStreetViews: Record<string, string> = {
  "translatinx-network-chelsea": "40.7453799,-73.9927467&fov=100&heading=43",
  "safe-horizon-streetwork-project-harlem":
    "40.8092233,-73.9489415&fov=75&heading=23&pano=1q_4cNgUdlutTKy1krIbMQ",
  "hebrew-immigrant-aid-society-hias-chelsea":
    "40.7505814,-73.9828556&fov=90&heading=120",
  "onpoint-nyc-fka-new-york-harm-reduction-educators-nyhre-new-york":
    "40.8476188,-73.9318492&fov=75&heading=172&pano=5G7xi0rjQI9bMsP93dBAJA",
  "exponents-financial-district":
    "40.7049851,-74.015982&pano=vpvwchRJL6CFb6tllWqDig",
  "fifth-avenue-committee-fac-park-slope":
    "40.6788677,-73.982829&fov=75&heading=25",
  "project-renewal-greenwich-village":
    "40.7283476,-74.0055243&fov=75&heading=102",
  "nyc-communities-for-health-nycc4h-greenwich-village":
    "40.8159089,-73.911101",
  "mount-sinai-east-village":
    "40.7232584,-73.9855946&fov=46&heading=138&pano=CuRFzBd1H38nBOgxCMmNMg",
  "mount-sinai-hells-kitchen": "40.7457307,-73.9944414&fov=100&heading=136",
  "safe-horizon-streetwork-project-lower-east-side":
    "40.715962,-73.9895885&pano=Og8nfXYAeqPuIhCULFwlHA",
  "curtis-community-school-food-club-st-george":
    "40.6447041,-74.0815597&heading=5&pano=g5Ri7-AoY0bwIihb1VflLA",
  "the-catholic-charities-community-services-of-the-archdiocese-of-new-york-cccs-yonkers":
    "40.9333832,-73.8730035",
  "cardinal-mccloskey-community-services-co-op-city":
    "40.8167429,-73.9201074&fov=40&heading=329",
  "rising-ground-fka-sheltering-arms-episcopal-social-services-queens-village":
    "40.7056394,-73.7944034&fov=30&heading=342",
  "ali-forney-center-afc-harlem":
    "40.8107313,-73.952378&fov=50&heading=66&pano=lBxUK6Ri31nB8eQxEVtx-g",
  "nyc-health-hospitalsgotham-health-stapleton":
    "40.7217531,-73.9957673&heading=209&fov=90",
  "xavier-mission-chelsea-46-w-16th-st-east-gate":
    "40.7377792,-73.995688&heading=52&fov=47",
  "betances-health-center-lower-east-side":
    "40.7139134,-73.9837604&heading=138&fov=75",
  "the-door-soho": "40.7242914,-74.0048353&heading=218",
  "callenlorde-harlem": "40.8092049,-73.9488999&fov=75&heading=27.56",
  "utopia-resource-center-greater-new-york-inc-longwood":
    "40.8257204,-73.9066956&fov=75&heading=217",
  "new-york-legal-assistance-group-nylag-financial-district":
    "40.704378,-74.0092833&fov=75&heading=245",
  "the-immigrant-defense-project-idp-midtown":
    "40.7523927,-73.9841574&fov=34&heading=195&pano=2zib_spaRRMUC4nQuzBm9g",
  "morris-heights-health-center-mhhc-fordham":
    "40.858515,-73.9030968&fov=75&heading=29",
  "community-counseling-and-mediation-ccm-clinton-hill":
    "40.6825612,-73.9666928&fov=75&heading=76",
  "xavier-mission-chelsea": "40.737738,-73.9955903&fov=75&heading=19",
  "community-access-inc-harlem": "40.8086959,-73.9486068&fov=68.8&heading=279",
  "the-door-mott-haven": "40.8191353,-73.9139016&fov=75&heading=319",
  "kings-county-family-court-downtown-brooklyn":
    "40.7019938,-73.8050714&fov=75&heading=343",
  "urban-justice-center-ujc-financial-district-40-rector-st-9th-fl":
    "40.7083989,-74.0148744&fov=75&heading=17&pano=9MWNrKcXa9qCGDKfVmBeBA",
  "osborne-association-brooklyn-heights":
    "40.693314,-73.9916768&fov=37.6&heading=25&pano=z5BOLIiqkCg0tgO-i_ZugQ",
  "st-johns-bread-and-life-bedford-stuyvesant":
    "40.6901949,-73.9290192&fov=37.6&heading=352&pano=q51uqSJypWsjIP_zsBxVAA",
  "services-and-advocacy-for-lgbtqia2s-elders-sage-chelsea-305-7th-avenue-15th-floor":
    "40.7468278,-73.9936864&fov=75&heading=104",
  "st-joes-soup-kitchen-greenwich-village":
    "40.7345397,-73.9950773&fov=75&heading=2.53",
  "city-living-ny-hells-kitchen": "40.7530035,-73.9928408&fov=41&heading=302",
  "holy-apostles-soup-kitchen-chelsea":
    "40.7494307,-73.999226&fov=75&heading=103&pano=sFzzJeWn6t0EmmTsuzzjKQ",
  "archdiocese-drug-abuse-prevention-program-adapp-throgs-neck":
    "40.8142485,-73.8188966&fov=75&heading=344",
  "department-of-probation-concourse":
    "40.8261779,-73.9207922&fov=75&heading=227",
  "athena-psych-mott-haven": "40.8156528,-73.9184618&fov=75&heading=325",
  "lenox-hill-neighborhood-house-midtown-east":
    "40.7583557,-73.9707781&fov=49&heading=48",
  "jewish-board-of-family-and-childrens-services-midtown":
    "40.7518574,-73.9899826&fov=75&heading=109",
  "association-of-community-employment-programs-for-the-homeless-ace-new-york-long-island-city":
    "40.7514405,-73.9339829&fov=75&heading=127&pano=XPS86tf6UeSNw9YeCOuGIQ",
  "project-hospitality-st-george": "40.6401638,-74.1317287&fov=41&heading=90",
  "chelsea-community-fridge-chelsea":
    "40.7377596,-73.9956277&fov=83&heading=29",
  "the-door-hudson-square": "40.7243052,-74.0048299&fov=83&heading=171",
  "first-presbyterian-church-of-brooklyn-downtown-brooklyn":
    "40.6969394,-73.9932997&fov=75&heading=296",
  "st-marys-clothing-drive-clinton-hill":
    "40.6927907,-73.9608212&fov=75&heading=274",
  "flatbush-friendly-fridge-prospect-lefferts-gardens":
    "40.659966,-73.9532554&fov=75&heading=2.15",
  "new-york-presbyterian-nyp-upper-east-side":
    "40.7584837,-73.9731509&fov=75&heading=47.07",
  "queens-affirming-youth-and-family-alliance-long-island-city":
    "40.7498346,-73.9359302&fov=75&heading=126",
  cojo: "40.6180558,-73.9593474&fov=75&heading=0.55",
  "legal-aid-society-concourse-260-e-161-st":
    "40.8256266,-73.9189653&fov=75&heading=197",
  "bronx-counseling-center": "40.8464853,-73.8937479&fov=75&heading=346",
  "safe-horizon-fort-greene": "40.6874692,-73.9798123&fov=75&heading=51",
  "morris-heights-health-center-mhhc-melrose":
    "40.8221619,-73.9149579&fov=75&heading=296",
  "council-of-peoples-organization-copo-ditmas-park":
    "40.6313348,-73.9664652&pano=UEKBdxOrUfLu2udaTOR0vQ",
  "bay-ridge-center-bay-ridge-15-bay-ridge-ave":
    "40.6385644,-74.0351451&fov=75&heading=90",
  "strive-aka-east-harlem-employment-services-east-harlem":
    "40.8016565,-73.9369507&fov=75&heading=50&pano=4cAi0Lm5z7LW57x6x0KU4Q",
};

export default customStreetViews;
