// Copyright (c) 2024 Streetlives, Inc.
//
// Use of this source code is governed by an MIT-style
// license that can be found in the LICENSE file or at
// https://opensource.org/licenses/MIT.

const customStreetViews: Record<string, string> = {
  "translatinx-network-hells-kitchen":
    "40.7453799,-73.9927467&fov=100&heading=43&pano=jlbFtqGBI2T9IaqNzaVNIg",
  "safe-horizon-streetwork-project-harlem":
    "40.8092233,-73.9489415&fov=75&heading=23&pano=1q_4cNgUdlutTKy1krIbMQ",
  "hebrew-immigrant-aid-society-hias-manhattan":
    "40.7505814,-73.9828556&fov=90&heading=120&pano=SUvsumL8fZZm3TtiQCKT5w",
  "onpoint-nyc-fka-new-york-harm-reduction-educators-nyhre-new-york":
    "40.8476188,-73.9318492&fov=75&heading=172&pano=5G7xi0rjQI9bMsP93dBAJA",
  "exponents-manhattan": "40.7049851,-74.015982&pano=vpvwchRJL6CFb6tllWqDig",
  "fifth-avenue-committee-fac-brooklyn":
    "40.6788677,-73.982829&fov=75&heading=25",
  "osborne-association-brooklyn":
    "40.6933035,-73.991688&fov=75&heading=21&pano=892end3jrlXm4ZXqwPaDmA",
  "project-renewal-greenwich-village":
    "40.7283476,-74.0055243&fov=75&heading=102&pano=h8KUmOxuQZ9XsHdY1zp-6w",
  "association-of-community-employment-programs-for-the-homeless-ace-new-york-astoria":
    "40.7515371,-73.9337768",
  "nyc-communities-for-health-nycc4h-bronx-westchester-ave":
    "40.8159089,-73.911101",
  "mount-sinai-east-village":
    "40.7232584,-73.9855946&fov=46&heading=138&pano=CuRFzBd1H38nBOgxCMmNMg",
  "mount-sinai-hells-kitchen": "40.7457307,-73.9944414&fov=100&heading=136",
  "safe-horizon-streetwork-project-lower-east-side":
    "40.715962,-73.9895885&pano=Og8nfXYAeqPuIhCULFwlHA",
  "curtis-community-school-food-club-staten-island":
    "40.6447041,-74.0815597&heading=5&pano=g5Ri7-AoY0bwIihb1VflLA",
  "the-catholic-charities-community-services-of-the-archdiocese-of-new-york-cccs-yonkers":
    "40.9333832,-73.8730035",
  "cardinal-mccloskey-community-services-bronx-e":
    "40.8167429,-73.9201074&fov=40&heading=329",
  "rising-ground-fka-sheltering-arms-episcopal-social-services-queens--19-jamaica-ave":
    "40.7056394,-73.7944034&fov=30&heading=342",
  "ali-forney-center-afc-harlem":
    "40.8107313,-73.952378&fov=50&heading=66&pano=lBxUK6Ri31nB8eQxEVtx-g",
  "nyc-health-hospitalsgotham-health-soho":
    "40.7217531,-73.9957673&heading=209&fov=90",
  "xavier-mission-chelsea-west": "40.7377792,-73.995688&heading=52&fov=47",
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
  "community-access-inc-harlem":
    "40.8086959,-73.9486068&fov=68.8&heading=279&pano=6-F9iLESnScNeF1zjPVXpw",
  "the-door-mott-haven": "40.8191353,-73.9139016&fov=75&heading=319",
  "kings-county-family-court-downtown-brooklyn":
    "40.7019938,-73.8050714&fov=75&heading=343&pano=Hyc69FGf9s2axmODEP0wZQ",
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
    "40.7493828,-73.9992104&fov=75&heading=103&pano=DPy_eGxJ-elTVmNXGsC3dA",
  "archdiocese-drug-abuse-prevention-program-adapp-throgs-neck":
    "40.8142485,-73.8188966&fov=75&heading=344",
  "department-of-probation-concourse":
    "40.8261779,-73.9207922&fov=75&heading=227",
  "athena-psych-mott-haven": "40.8156528,-73.9184618&fov=75&heading=325",
};

export default customStreetViews;
