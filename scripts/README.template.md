<!-- This file is generated from tools.yaml and scripts/README.template.md by scripts/build.py - edit those instead! -->
# Neuroscience tools

Together with collaborators and contributors from many other labs, we have developed multiple tools to work with neuroanatomical and connectomics data. Here is a quick overview
(also available as a website: **[flyconnectome.github.io/tools](https://flyconnectome.github.io/tools/)**):

<p align="center">
<img src="https://github.com/flyconnectome/tools/raw/main/img/tools.png" width="600">
</p>

Below are brief descriptions and links of the libraries/packages. For details, I defer to their respective (excellent) docs.

## No code required: Coda
[Coda](https://coda.science) (**co**nnectome **d**ata **a**nalysis) is a browser-based node editor for querying and analyzing connectomic data - a great place to start if you don't want to write code (yet):

- build analysis/exploration pipelines by connecting nodes
- morphological (NBLAST, axon-dendrite splits, etc.) and connectivity (graph, shortest path, influence scores, etc.) analyses
- works with neuPrint, CAVE (e.g. FlyWire) and CATMAID datasets as well as local data
- export results as CSV, SWC, images, Neuroglancer URLs, etc. or convert entire workflows to Python or R code to run locally
- AI assistant to generate workflows from natural language, and share workflows via links

The source code is on [Github](https://github.com/navis-org/coda).

## R
In R, the [natverse](https://natverse.org) (published in [Bates, Manton _et al._, 2020](https://doi.org/10.7554/eLife.53350)) is your one-stop-shop for all things neuron: it's a collection of various R packages that are built on top of the **n**euro**a**natomy **t**oolbox, `nat`. Check out the [full list of packages](https://natverse.org/packages/). Of particular relevance:

### General
{{r/general}}

### Data access
{{r/data}}

### Connectome datasets
These packages provide dataset-specific conveniences (meta data, annotations, transforms, etc.) on top of the general-purpose libraries above:

{{r/datasets}}

### Connectomics analyses
{{r/analysis}}

## Python
In Python, we find packages analogous to those in R:

### General
{{python/general}}

### Data access
{{python/data}}

### Connectomics analyses
{{python/analysis}}

## AI coding assistants
If you use AI coding assistants (Claude, ChatGPT & co.), these MCP servers give them access to our tools:

{{ai}}

## Noteworthy mentions
There are a few more packages/functions that might be of interest:

<p align="center">
<img src="https://github.com/flyconnectome/tools/raw/main/img/tools2.png" width="600">
</p>

### NBLAST
NBLAST is an algorithm that computes morphological similarity between neurons ([Costa et al., 2016](https://doi.org/10.1016/j.neuron.2016.06.012)). This has proven incredibly useful to find similar neurons across datasets but also to cluster neurons into cell types.

On the R side the algorithm is implemented in [`nat.nblast`](https://natverse.org/nat.nblast/) and in Python it is part of `navis` (see this [tutorial](https://navis-org.github.io/navis/stable/generated/gallery/5_nblast/tutorial_nblast_00_intro/)).

### Transforms
Neuroanatomical databases (like e.g. VirtualFlyBrain) typically register neurons to a template space which facilitates e.g. co-visualization of neurons from different
datasets. If you want to transform spatial data between template brains, e.g. from FAFB ("FAFB14") to the Janelia hemibrain ("JRCFIB2018F"), you should look for [`nat.flybrains`](https://natverse.org/nat.flybrains/) & [`nat.jrcbrains`](https://github.com/natverse/nat.jrcbrains) in R and [`navis-flybrains`](https://github.com/navis-org/navis-flybrains) in Python. For fish and mouse data, check out [`navis-fishbrains`](https://github.com/navis-org/navis-fishbrains) and [`navis-mousebrains`](https://github.com/navis-org/navis-mousebrains). These also allow you to define custom transforms e.g. via landmarks.

## Citing
If these tools helped your research, please cite them. In short: the [natverse paper](https://doi.org/10.7554/eLife.53350) for natverse (R) packages,
and the [NBLAST paper](https://doi.org/10.1016/j.neuron.2016.06.012) when using NBLAST.

> **Citing `navis`:** there is no `navis` paper yet (one is in the works). Until then, please cite its Zenodo DOI
> [10.5281/zenodo.4699382](https://doi.org/10.5281/zenodo.4699382), ideally with the version you used.

See the [publications page](https://flyconnectome.github.io/tools/publications.html) for what to cite for each tool, plus a selection of publications that used them.

## Get in touch
- **Questions and bug reports:** please open an issue (or, where enabled, a discussion) on the GitHub repository of the tool in question.
- **Something missing or out of date in this list?** Open an issue here or edit [`tools.yaml`](tools.yaml).
- **Everything else** (collaborations, general enquiries): email us at [flyconnectome@gmail.com](mailto:flyconnectome@gmail.com).
