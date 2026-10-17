<!-- This file is generated from tools.yaml and scripts/README.template.md by scripts/build.py - edit those instead! -->
# Neuroscience tools

We have developed multiple tools to work with neuroanatomical and connectomics data. Here is a quick overview
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
1. [`nat`](https://natverse.org/nat/) is a general-purpose library for working with neuronanatomical data.
   I highly recommend having a look at the "Articles" in nat's [doc](https://natverse.org/nat/).
2. [`nat.nblast`](https://natverse.org/nat.nblast/) implements the NBLAST algorithm for morphological comparison of neurons (see [below](#nblast)).
3. [`nat.templatebrains`](https://natverse.org/nat.templatebrains/), [`nat.flybrains`](https://natverse.org/nat.flybrains/) and [`nat.jrcbrains`](https://github.com/natverse/nat.jrcbrains) bundle template brains and transforms that let you xform e.g. neurons from one brain template to another (see [below](#transforms)).
4. [`nat.ggplot`](https://natverse.org/nat.ggplot/) helps you make publication-quality 2D renderings of neurons using `ggplot2`.

### Data access
1. [`neuprintr`](https://natverse.org/neuprintr/) lets you run queries against [neuPrint](https://neuprint.janelia.org) servers such as those hosting the Janelia connectomes.
2. [`rcatmaid`](https://natverse.org/rcatmaid/) provides an interface with CATMAID servers such as those the VFB uses to host published data from the
   FAFB or larval fruit fly datasets. `rcatmaid` is built on top of `nat` and you can use `nat` functions with neurons pulled via `rcatmaid`.
3. [`neuromorphr`](https://natverse.org/neuromorphr/) lets you search and pull data from [neuromorpho.org](https://neuromorpho.org).
4. [`insectbrainr`](https://natverse.org/insectbrainr/) provides access to the [InsectBrainDB](https://insectbraindb.org).
5. [`neuronbridger`](https://natverse.org/neuronbridger/) provides access to [NeuronBridge](https://neuronbridge.janelia.org) for matching EM neurons to light-level data.
6. [`fishatlas`](https://github.com/natverse/fishatlas) provides R client utilities for interacting with the [Fish Brain Atlas Project](https://www.bi.mpg.de/baier/connectome), which has [successfully](https://doi.org/10.1016/j.neuron.2019.04.034) acquired and registered almost 2,000 neurons from the larval zebrafish into a standard, annotated template space.
7. [`mouselightr`](https://github.com/natverse/mouselightr) provides an interface with the [MouseLight](https://www.janelia.org/project-team/mouselight) project at [Janelia Research Campus](https://www.janelia.org/), which has [successfully](https://doi.org/10.1016/j.cell.2019.07.042) acquired and registered ~1,000 neurons from the mouse brain into a standard, annotated template space.
8. [`seatabler`](https://flyconnectome.github.io/seatabler/) is a generic R client for [SeaTable](https://seatable.io/en/) servers, which we use to manage annotations for various connectome datasets (WIP: still in the design phase and not yet ready for use).

### Connectome datasets
These packages provide dataset-specific conveniences (meta data, annotations, transforms, etc.) on top of the general-purpose libraries above:

1. [`fafbseg`](https://natverse.org/fafbseg/) for the [FlyWire](https://flywire.ai) whole-brain connectome (FAFB).
2. [`hemibrainr`](https://natverse.org/hemibrainr/) for the Janelia hemibrain.
3. [`malecns`](https://natverse.org/malecns/) for the Janelia [male CNS](https://www.janelia.org/project-team/flyem/male-cns-connectome).
4. [`malevnc`](https://natverse.org/malevnc/) for the Janelia male adult nerve cord (MANC).
5. [`fancr`](https://flyconnectome.github.io/fancr/) for the female adult nerve cord (FANC).
6. [`bancr`](https://natverse.org/bancr/) for the brain and nerve cord (BANC).
7. In-progress datasets (access may be restricted): [`crantr`](https://flyconnectome.github.io/crantr/) (clonal raider ant brain),
   [`yakuba`](https://flyconnectome.github.io/yakuba/) (_D. yakuba_ male VNC),
   [`aedes`](https://flyconnectome.github.io/aedes/) (_Aedes aegypti_ brain) and [`fishr`](https://flyconnectome.github.io/fishr/) (fish2 larval zebrafish brain).

### Connectomics analyses
1. [`coconat`](https://natverse.org/coconat/) provides dataset-agnostic building blocks for connectome analyses.
2. [`coconatfly`](https://natverse.org/coconatfly/) builds on `coconat` to provide a uniform interface for comparative connectomics across _Drosophila_ datasets (FlyWire, hemibrain, male CNS, MANC, FANC, BANC, etc.).
3. [`influencer`](https://natverse.org/influencer/) computes influence scores (i.e. indirect connectivity) of neurons in connectomes.

## Python
In Python, we find packages analogous to those in R:

### General
1. [`navis`](https://navis-org.github.io/navis/stable/) is `nat`'s serpentine sibling: a general purpose neuron library for visualization and analysis
   of neuroanatomical data. It also implements NBLAST and transforms, and features interfaces e.g. with
   [Blender 3D](https://www.blender.org),
   [neuPrint](https://navis-org.github.io/navis/stable/generated/gallery/4_remote/tutorial_remote_00_neuprint/),
   [MICrONS](https://navis-org.github.io/navis/stable/generated/gallery/4_remote/tutorial_remote_02_microns/),
   [neuromorpho](https://neuromorpho.org),
   [NEURON](https://navis-org.github.io/navis/stable/generated/gallery/3_interfaces/tutorial_interfaces_00_neuron/) and
   [InsectBrainDB](https://navis-org.github.io/navis/stable/generated/gallery/4_remote/tutorial_remote_03_insect_db/). Check
   out the [Quickstart](https://navis-org.github.io/navis/stable/quickstart/) article
   and the various [tutorials](https://navis-org.github.io/navis/stable/generated/gallery/).
2. [`flybrains`](https://github.com/navis-org/navis-flybrains), [`fishbrains`](https://github.com/navis-org/navis-fishbrains) and [`mousebrains`](https://github.com/navis-org/navis-mousebrains)
   bundle template brains and transforms for use with `navis` that let you xform e.g. neurons from one brain template to another (see [below](#transforms)).
3. [`octarine`](https://schlegelp.github.io/octarine/) is a fast, lightweight 3D viewer; together with the [`octarine-navis-plugin`](https://github.com/navis-org/octarine-navis-plugin) it serves as a high-performance 3D plotting backend for `navis`.
4. [`nglscenes`](https://github.com/schlegelp/nglscenes) lets you generate and manipulate [neuroglancer](https://github.com/google/neuroglancer) scenes (from/to URLs, files or the clipboard), and run and remote-control a local neuroglancer.
5. [`fastcore`](https://schlegelp.github.io/fastcore-rs/) re-implements core `navis` and `nat` functions for working with neuron trees in Rust (`navis` uses this under the hood when installed). It comes with Python and R bindings.
6. [`skeletor`](https://github.com/navis-org/skeletor) implements various skeletonization algorithms for meshes (`navis` uses this internally).
7. [`sparse-cubes`](https://github.com/navis-org/sparse-cubes) is a library for extracting meshes from sparse voxel data (i.e. x/y/z voxel coordinates instead of a dense 3D matrix).

### Data access
1. [`connecto`](https://schlegelp.github.io/connecto/) provides a unified interface for querying connectomes: the same calls work across datasets and backends (neuPrint, CAVE),
   taking care of each dataset's quirks (e.g. root IDs vs body IDs, naming conventions for cell types and sides).
2. [`fafbseg`](https://fafbseg-py.readthedocs.io/en/latest/) provides functions to work with the FlyWire connectome (FAFB).
3. [`pymaid`](https://pymaid.readthedocs.io/en/latest/) lets you interface with CATMAID servers. Critically, it's built on top of `navis` and you can
   use any `navis` function with `pymaid` neurons. Side note: due to a name clash the library is called `python-catmaid` on PyPI.
4. [`dvidtools`](https://dvidtools.readthedocs.io/en/latest/) lets you fetch data from [DVID](https://github.com/janelia-flyem/dvid) servers such as those used by Janelia for in-progress datasets.
5. [`neuprint-python`](https://connectome-neuprint.github.io/neuprint-python/docs/) is Janelia's official Python client for [neuPrint](https://neuprint.janelia.org) servers. It's not one of our tools but we have contributed
   substantially (including the query functions for the first release); `navis` wraps it to fetch neurons as `navis` objects.
6. [`sea-serpent`](https://github.com/schlegelp/sea-serpent) is a dataframe-like wrapper around the [SeaTable](https://seatable.io/en/) API, which we use to manage annotations for various connectome datasets.

### Connectomics analyses
1. [`cocoa`](https://github.com/flyconnectome/cocoa) is a library for comparative connectomics: matching, connectivity, co-clustering and cell typing across _Drosophila_ datasets (FlyWire, hemibrain, MANC, male CNS).
2. [`bigclust2`](https://flyconnectome.github.io/bigclust2/) is a graphical interface for interactively exploring, clustering and annotating large (100k's of neurons) morphological or connectivity-based embeddings.
   It's a complete rewrite of [`bigclust`](https://github.com/flyconnectome/bigclust).

## AI coding assistants
If you use AI coding assistants (Claude, ChatGPT & co.), these MCP servers give them access to our tools:

1. [`coda-mcp`](https://coda.science/mcp.html) lets your AI client build and run workflows in Coda.
2. [`natmcp`](https://flyconnectome.github.io/natmcp/) gives coding agents current, accurate information about natverse functions, idioms and datasets (experimental).

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
