# Neuroscience tools

We have developed multiple tools to work with neuroanatomical data. Here is a quick overview:

<p align="center">
<img src="https://github.com/flyconnectome/how_to/blob/main/tools1.png" width="600">
</p>

Below are brief descriptions of the libraries/packages. For details, I defer to their respective (excellent) documentations.

## R
In R, the [natverse](http://natverse.org) is your one-stop-shop for all things neuron: it's a collection of various R packages that are built on top of
the **n**euro**a**natomy **t**oolbox, `nat`. Of particular relevance:

1. [`nat`](http://natverse.org/nat/) is a general-purpose library for working with neuronanatomical data.   
   I highly recommend having a look at the "Articles" in nat's [doc](http://natverse.org/nat/).
2. [`neuprintr`](http://natverse.org/neuprintr/reference/) and [`hemibrainr`](http://natverse.org/hemibrainr/) provide an interface with
   neuPrint and the Janelia hemibrain dataset ([link](https://neuprint.janelia.org)). The former lets you run queries
   against neuPrint's neo4j database while the latter contains meta data and various convenience functions to work with the hemibrain dataset.
3. [`rcatmaid`](http://natverse.org/rcatmaid/) provides an interface with CATMAID servers such as those the VFB uses to host published from the
   FAFB or larval fruit fly dataset. `rcatmaid` is built on top of `nat` and you can use `nat` functions with neurons pulled via `rcatmaid`.
4. [`neuromorphr`](https://natverse.github.io/neuromorphr/) lets you search and pull data from neuromorpho.org
5. [`fishatlas`](https://github.com/natverse/fishatlas) provides R client utilities for interacting with the [Fish Brain Atlas Project](https://www.neuro.mpg.de/baier/connectome), which has [successfully](https://www.cell.com/neuron/pdfExtended/S0896-6273(19)30391-5) acquired and registered almost 2,000 neurons from the larval zebrafish into a standard, annotated template space.
6. [`mouselightr`](https://github.com/natverse/mouselightr) provides an interface with the [MouseLight](http://mouselight.janelia.org/) at [Janelia Research Campus](https://www.janelia.org/), which has [successfully](https://www.cell.com/neuron/pdfExtended/S0896-6273(19)30391-5) acquired and registered almost ~1,000 neurons from the mouse into a standard, annotated template space.

## Python
In Python, we find packages analogous to those in R:

1. [`navis`](https://navis.readthedocs.io/en/latest/) is `nat`'s serpentine sibling: a general purpose neuron library for visualization and analysis
   of neuronal morphologies. It also features interfaces e.g. with
   [Blender 3D](https://www.blender.org),
   [neuPrint](https://navis.readthedocs.io/en/latest/source/tutorials/neuprint.html),
   [MICRoNs](https://navis.readthedocs.io/en/latest/source/tutorials/microns_tut.html),
   neuromorpho,
   [NEURON](https://navis.readthedocs.io/en/latest/source/tutorials/neuron.html) and
   [InsectBrainDB](https://navis.readthedocs.io/en/latest/source/tutorials/insectbraindb.html)
3. [`pymaid`](https://pymaid.readthedocs.io/en/latest/) lets you interface with CATMAID servers. Critically, it's built on top of `navis` and you can
    use any `navis` function with `pymaid` neurons. Side note: due to a name clash the library is called `python-catmaid` on PyPI.

## Noteworthy mentions
There are a few more packages/functions that you might hear about:

<p align="center">
<img src="https://github.com/flyconnectome/how_to/blob/main/tools2.png" width="600">
</p>

### NBLAST
NBLAST is an algorithm that computes morphological similarity between neurons ([Costa et al., 2016](https://doi-org.ezp.lib.cam.ac.uk/10.1016/j.neuron.2016.06.012). This has proven incredibly useful to find similar neurons across datasets but also to cluster neurons into cell types.

On the R side the algorithm is implemented in [`nat.nblast`](https://natverse.github.io/nat.nblast/) and in Python it is part of `navis` (see this [tutorial](https://navis.readthedocs.io/en/latest/source/tutorials/nblast.html)).

### Transforms
Neuronanatomical databases (like e.g. VirtualFlyBrain) typically register neurons to a template space which facilitates e.g. co-visualization of neurons from different
datasets. If you want to transform spatial data between template brains, e.g. from FAFB ("FAFB14") to hemibrain ("JRCFIB2018F"), you should look for [`nat.flybrains`](https://natverse.github.io/nat.flybrains/) & [`nat.jrcbrains`](https://github.com/natverse/nat.jrcbrains) in R and [`navis-flybrains`](https://github.com/schlegelp/navis-flybrains) in Python. These also allow you to define custom transforms e.g. via landmarks.
