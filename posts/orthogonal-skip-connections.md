# Orthogonal skip connections

---

> **Summary**: inspired by ResNets, which look like $(f_1 + I) \circ (f_2 + I) \circ \ldots \circ (f_L + I) (x)$, we study networks of form $(f_1 + W_1) \circ (f_2 + W_2) \circ \ldots \circ (f_L + W_L) (x)$, where $W_i$ are orthogonal matrices. Empirical results show that performance is similiar in both cases.

---

Residual connections proposed in the [ResNet paper](https://arxiv.org/abs/1512.03385) were a breakthrough since they enabled training of very deep networks. Very deep networks are nice because they can learn more complex mappings. For example, humanoid RL agents trained with 1000 layer networks [suddenly learned jumping](https://arxiv.org/abs/2503.14858) over walls when faced with navigating a labirynth. Notably, the original [Transformer](https://arxiv.org/abs/1706.03762) model also employed residual connections, and they are now a staple in deep learning architectures.

Let's assume we want to learn some   function $f : \mathbb{R}^d \to \mathbb{R}^d$. What ResNet did, is instead of learning a composition of some simple non-linear functions $f_1 \circ f_2 \circ \ldots \circ f_L$, they learn a more stable composition of near-identity functions $(f_1 + I) \circ (f_2 + I) \circ \ldots \circ (f_L + I) (x)$, where $I$ is the identity matrix $I(x) = x$. 

The intuition is that if $f_i$ are small, then $f_i + I$ is close to the identity function, which is easy to optimize. The network can learn to make $f_i$ small, and then fine-tune them to get the desired function.

If we did backpropagation through $f(x) = f_1 \circ f_2 \circ \ldots \circ f_L (x)$, a single block would have:
$$
x_{l+1} = f_l(x_l) \implies \frac{\partial x_{l+1}}{\partial x_l} = \frac{\partial f_l(x_l)}{\partial x_l} = J_{f_l}(x_l)
$$
if the Jacobian $J_{f_l}(x_l)$ has an [operator norm](https://en.wikipedia.org/wiki/Operator_norm) greater than 1, then the gradient will explode, since 
$$
\|| \frac{\partial \mathcal{L}}{\partial x_0} \|| = \|| \frac{\partial \mathcal{L}}{\partial x_L} \cdot \prod_{l=1}^L J_{f_l}(x_l) \|| \approx \prod_{l=1}^L \|| J_{f_l}(x_l) \|| \to \infty
$$

On the other hand, if we have skip connections, then a single block would contribute $ J_{f_l}(x_l) + I$ to the gradient through the network, so assuming each block is close to identity, these contributions will be negligible, so the gradient will not explode.

It is therefore desirable to have $\|| I(x) \|| = \|| x \||$. But this is the exact defining property of orthogonal (or more generally, unitary) matrices. I think that **with orthogonal matrices we could have even deeper networks**. I think this is because a skip connection $W_i$ would now have more representational power, so it could absorb some more complexity from the function $f_i$. 

To support this claim, I proved this theorem, which is adopted from [this paper](https://arxiv.org/abs/1804.05012).

## Theory

> **Theorem**. Let $f(x) : \mathbb{R}^d \to \mathbb{R}^d$ be some *sufficiently nice* function (more details [here](https://github.com/gournge/orthogonal-skip-connections)). Let $W_i, i \in \mathbb{N}$ be *any* $d \times d$ orthogonal matrices. Then there exist functions $f_i$ so that the following holds:
> $$
>     f(x) = (f_1 \circ f_2 \circ \ldots \circ f_L) (x)
> $$
> and the following terms decrease in $O\left(\frac{\log m}{m}\right)$ rate:  $\||f_i-W_i\||_L, \ \|| I - W_i\||$ for $i=1,\ldots,L$.

So in plain words: **we can approximate functions with near-orthogonal matrices**.

The proof is a lot of algebra, but the main idea is using the identity $\|| W(x) \|| = \|| x \||$. I wasn't able to prove a version of the theorem without the constraint of $\|| I - W_i\||$ decreasing.

## Practice

<!-- ![Orthogonal skip connections vs identity skip connections](posts/image.png) -->
<div style="display: flex; justify-content: center;">
  <img src="posts/image.png" alt="Orthogonal skip connections vs identity skip connections" width="500"/>
</div>



## Related work

<!-- Table comparing 3 versions of \texttt{block}(v) -->
<div style="display: flex; justify-content: center;">
<table style="border-collapse: collapse; width: 80%; text-align: left; font-size: 16px;">
  <tr>
    <th>Connection</th>
    <th>$\texttt{block}(v)$</th>
    <th>Notes</th>
  </tr>
  <tr>
    <td>Identity skip connections</td>
    <td>$f(v) + v$</td>
    <td>ResNet paper baseline</td>
    <!-- <td>ResNet paper [cite]</td> -->
  </tr>
  <tr>
    <td>Orthogonal skip connections</td>
    <td>$f(v) + W_iv$</td>
    <td>This post; ~$2\%$ improvement</td>
    <!-- <td>This post (see theorem above)</td> -->
  </tr>
  <tr>
    <td>Orthogonal projections in skip connections</td>
    <td>$P_v(f(v)) + v$</td>
    <td>~$2\%$ improvement</td>
    <!-- <td>No theoretical guarantees yet</td> -->
  </tr>
  <tr>
    <td>(Manifold-Constrained) Hyper-Connections</td>
    <td>$\mathcal{H}_{post}^T f(\mathcal{H}_{pre} v) + \mathcal{H}_{res}(v)$</td>
    <td> ~$2\%$ improvement; $\mathcal{H}_{res}$ is a <a href="https://en.wikipedia.org/wiki/Convex_combination#Definition">convex combination</a> of permutation matrices</td>
    </td>
    <!-- <td>No theoretical guarantees yet</td> -->
</table>
</div>

**Orthogonal skip connections**. [This paper](https://arxiv.org/abs/1707.05974) proposed orthogonal skip connections in 2017. They had similiar justifications - stability of the gradient flow - but they didn't provide any theoretical guarantees. It showed ~2% empirical improvements.

**Orthogonal projections in skip connections**. [This paper](https://arxiv.org/abs/1707.05974) also proposed the idea of using $\texttt{block}(v) = P_v(f(v)) + v$ in each block, where $P_W$ is an orthogonal projection onto the residual stream. It showed ~2% improvement in some image benchmarks.

**(Manifold-Constrained) Hyper-Connections**. [This Deepseek's paper](https://arxiv.org/abs/2512.24880) showed training of a 27B parameter language model with skip connections of the form
$$
\mathcal{H}_{post}^T f(\mathcal{H} _{pre} v) + \mathcal{H} _{res}(v)
$$

$\mathcal{H} _{post}, \mathcal{H} _{pre}$ are mappings that enhance numerical stability, and $\mathcal{H} _{res}$ is a convex combination of permutation matrices. $\mathcal{H} _{res}$ mixes signals from the residual stream, while also preserving gradient flow.

**Not using skip connections**. There are also some works that decrease the influence of skip connections across layers, or even remove them entirely. For example [this paper](https://arxiv.org/abs/2404.10947) showed that decreasing the influence of skip connections across layers lead to better performance **by even 10%**.

## Some notes

- In high dimensions random matrices are close to orthogonal, since 2 random vectors are close to orthogonal. We could somehow use that fact to train networks more efficiently, or obtain some exponential identities, like in case of Johnson-Lindenstrauss lemma.
- To efficiently keep orthogonal matrices orthogonal, I borrowed an idea from the [Muon optimizer](https://kellerjordan.github.io/posts/muon/), which uses a Newton-Schulz iteration for this purpose.