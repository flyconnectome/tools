"""Export the neurons shown in the website's hero to docs/data/hero.{json,bin}.

Only needs to be re-run if you want to change the neurons. Requires:
    pip install fafbseg navis flybrains trimesh fast-simplification

Binary layout of hero.bin (little-endian), N = total number of skeleton nodes:
    int32[N]        parent index of each node within its neuron (-1 = root)
    int16[N * 3]    node x/y/z in units of `scale_um` (0.1 microns)
    int16[nv * 3]   brain mesh vertices (same units)
    uint16[nf * 3]  brain mesh faces
Neurons are stored back to back in the order listed in hero.json.
"""
import json
from pathlib import Path

import flybrains
import navis
import numpy as np
import trimesh
from fafbseg import flywire

OUT = Path(__file__).resolve().parent.parent / "docs" / "data"
CELL_TYPES = ["APL", "DA1_lPN", "DA2_lPN", "DL3_lPN", "DC3_adPN", "DM6_adPN", "VA1v_adPN", "VM5d_adPN"]
SIDE = "right"
MATERIALIZATION = 783
SCALE_NM = 100  # store coordinates in 0.1 micron steps (fits int16 for the whole brain)


def main():
    # Pick one neuron per cell type and map it to the public release via its supervoxel
    ann = flywire.get_hierarchical_annotations()
    sel = (ann[ann.cell_type.isin(CELL_TYPES) & (ann.side == SIDE)]
           .drop_duplicates("cell_type").set_index("cell_type").loc[CELL_TYPES])
    roots = flywire.supervoxels_to_roots(sel.supervoxel_id.values, timestamp=f"mat_{MATERIALIZATION}", dataset="public")
    sel["root"] = roots

    skeletons = flywire.get_skeletons(sel.root.values, dataset=MATERIALIZATION)
    skeletons = {int(n.id): n for n in skeletons}

    parents, coords, meta = [], [], []
    for ct, root in zip(sel.index, sel.root):
        # APL is enormous - downsample it more aggressively
        n = navis.downsample_neuron(skeletons[int(root)], 8 if ct == "APL" else 3, inplace=False)
        idx = {nid: i for i, nid in enumerate(n.nodes.node_id)}
        parents.append(np.array([idx.get(p, -1) for p in n.nodes.parent_id], dtype="<i4"))
        coords.append(np.round(n.nodes[["x", "y", "z"]].values / SCALE_NM).astype("<i2").ravel())
        meta.append({"name": ct, "root_id": str(root), "n": int(n.n_nodes)})
        print(f"{ct}: {n.n_nodes} nodes")

    # Brain outline (FlyWire space, nm), simplified
    b = flybrains.FLYWIRE.mesh
    # (simplify in microns - decimation stalls with the large nm coordinates)
    brain = trimesh.Trimesh(np.asarray(b.vertices) / 1000, np.asarray(b.faces), process=False)
    brain.merge_vertices()
    brain = brain.simplify_quadric_decimation(face_count=10000)
    bv = np.round(np.asarray(brain.vertices) * 1000 / SCALE_NM).astype("<i2")
    bf = np.asarray(brain.faces).astype("<u2")

    OUT.mkdir(parents=True, exist_ok=True)
    with open(OUT / "hero.bin", "wb") as f:
        for p in parents:
            f.write(p.tobytes())
        for c in coords:
            f.write(c.tobytes())
        f.write(bv.ravel().tobytes())
        f.write(bf.ravel().tobytes())
    with open(OUT / "hero.json", "w") as f:
        json.dump({"source": f"FlyWire public release, materialization {MATERIALIZATION} "
                             "(Dorkenwald et al., 2024; Schlegel et al., 2024)",
                   "scale_um": SCALE_NM / 1000,
                   "neurons": meta,
                   "brain": {"nv": int(len(bv)), "nf": int(len(bf))}}, f, indent=1)
    print(f"Wrote {OUT / 'hero.bin'} ({(OUT / 'hero.bin').stat().st_size / 1e6:.2f} MB)")


if __name__ == "__main__":
    main()
