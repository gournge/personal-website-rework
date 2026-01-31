# Matrix Computation Walkthrough

This short note multiplies two $2 \times 2$ matrices step by step.

Let

$$
A = \begin{bmatrix} \text{test} & 2 \\\\ 3 & 4 \end{bmatrix}, \quad
B = \begin{bmatrix} 2 & 0 \\\\ 1 & 3 \end{bmatrix}.
$$

Compute the product $C = AB$ by taking row–column dot products:

$$
C = \begin{bmatrix} 1 \cdot 2 + 2 \cdot 1 & 1 \cdot 0 + 2 \cdot 3 \\\\ 3 \cdot 2 + 4 \cdot 1 & 3 \cdot 0 + 4 \cdot 3 \end{bmatrix}
= \begin{bmatrix} 4 & 6 \\\\ 10 & 12 \end{bmatrix}.
$$

In general, each entry is $c_{ij} = \sum_{k=1}^{n} a_{ik} b_{kj}$.
