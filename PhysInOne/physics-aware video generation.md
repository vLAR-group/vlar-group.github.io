\subsection{Physics-aware Video Generation}\label{sec:exp_vid_gen}

While video generation models demonstrate significant advancements in visual fidelity, they frequently fail to capture physically plausible dynamics \cite{Motamed2025,Kang2024}. \nickname{} contains diverse and massive dynamic activities following a variety of daily physical phenomena. This rich repository serves as an ideal resource for training or fine-tuning next-generation video models that faithfully emulate real-world physics.

In this section, we conduct fine-tuning experiments on three representative video models: 1) \textbf{SVD}-XT \cite{Blattmann2023}, a UNet-based image-to-video (I2V) model; 2) \textbf{CogVideoX}-1.5-5B \cite{Yang2025}, a Transformer-based text-image-to-video (TI2V) model; and 3) \textbf{Wan2.2}-5B \cite{Wan2025}, the latest Transformer and flow matching based TI2V model in the field. For these models, we adopt three commonly used fine-tuning techniques: 1) Low-Rank Adaptation (\textbf{LoRA}) \cite{Hu2021}, 2) Supervised Fine-Tuning (\textbf{SFT}) \cite{Howard2018}, and 3) Final Layer Tuning (\textbf{FLT}) \cite{Yosinski2014}. To showcase the potential of \nickname{}, we randomly sample a subset of training videos (83,650 text-video pairs) for fine-tuning all models until convergence. All fine-tuned models and their original models are then evaluated on a subset of test videos (772 text-video pairs, called \textit{test-small}). More details of experiment settings are provided in Appendix \ref{app:vid_gen_exp}.   

\textbf{Metrics}: Traditional metrics such as \textbf{FVD} \cite{Unterthiner2018} primarily assess visual realism in video generation, but are inadequate for evaluating the physical plausibility of motion. Some recent studies \cite{He2024,Bansal2025} use video-based VLMs to assess physical commonsense. However, these models often fail to produce meaningful evaluations, as they fundamentally lack an understanding of physical laws and are thus ill-suited for judging physical correctness. Other works \cite{Meng2025,Chow2025,Shen2025} introduce benchmarks featuring QA tasks to probe physical understanding, but they are typically qualitative and cannot quantitatively measure the correctness of physical motions. 

To this end, we introduce a novel metric for the quantitative assessment of physical motion fidelity in generated videos. Particularly, given a reference video $\mathcal{V}_{ref}$ exhibiting physically accurate motion (\eg{}, from our test set) and an AI-generated video $\mathcal{V}_{gen}$ 
produced using identical initial frame(s) and textual prompts as $\mathcal{V}_{ref}$, ensuring controlled comparison conditions, we apply discrete Fourier transform (DFT) to obtain their respective frequency domain representations. We then compare the energy (squared amplitude) of $DFT(\mathcal{V}_{ref})$ and $DFT(\mathcal{V}_{gen})$ and introduce \textbf{Physical Motion Fidelity (PMF)}, defined as follows:
\vspace{-0.1cm}
\begin{equation}
\setlength{\abovedisplayskip}{3pt}
\setlength{\belowdisplayskip}{3pt}
    PMF = f_{energy}\Big(
    DFT(\mathcal{V}_{gen}), DFT(\mathcal{V}_{ref})
    \Big)
\end{equation}

PMF quantifies kinematic discrepancies between the dynamic trajectories in $\mathcal{V}_{gen}$ and $\mathcal{V}_{ref}$. Crucially, higher PMF scores indicate less deviation from the reference motion patterns. The metric fundamentally differs from pixel-level similarity measures by evaluating physical fidelity rather than visual correspondence, as frame-perfect alignment is neither achievable nor desirable in generative tasks.

To empirically validate physical plausibility from a human perspective, we additionally conduct a user study to assess generated videos. Higher human ratings reflect greater perceived physical plausibility in the video content. More details of our metric and human rating are in Appendix \ref{app:vid_gen_exp}.

\begin{figure*}[t]
\centering
\includegraphics[width=1\linewidth]{figs/video_gen_cam.pdf}
\vskip -0.1in
\caption{Qualitative examples demonstrating improved physical plausibility in videos generated after fine-tuning on \nickname{}.}
\label{fig:vid_gen_res}
\vspace{-0.2cm}
%\vskip 0.4in
\end{figure*}

\begin{figure*}[t]
\centering
\includegraphics[width=1\linewidth]{figs/future_pred_cam2.pdf}
\vskip -0.1in
\caption{Qualitative examples of long-term future frame prediction by current methods for trained viewpoints.}
\label{fig:future_pred_res}
\vspace{-0.4cm}
%\vskip 0.4in
\end{figure*}



\begin{table}[thb] \tabcolsep=0.3cm \vspace{-0.3cm}
\centering
\caption{The left part shows quantitative results of video generation models with and without fine-tuning on \nickname{}. The right part shows PMF scores across four physical domains separately.
}\vspace{-0.25cm}
\label{tab:vid_gen_res}
\setlength{\tabcolsep}{2.0pt}
\resizebox{0.48\textwidth}{!}{
\begin{tabular}{lccccccc}
\toprule[1.0pt]
\rowcolor{headergray} 
 & & & Human& Mechanics & Magnetism& Optics & Fluid \\

% Row 2: Set color and put the text here using negative multirow
\rowcolor{headergray} 
& \multirow{-2}{*}{PMF $\uparrow$} & \multirow{-2}{*}{FVD $\downarrow$} & Rating $\uparrow$ & PMF $\uparrow$ & PMF $\uparrow$ & PMF $\uparrow$ &PMF $\uparrow$ \\ 

\toprule[1.0pt]
SVD \cite{Blattmann2023} & 2.753 & 203 & \textbf{6.09} & \cellcolor[HTML]{FFD8BF} 2.763  & \cellcolor[HTML]{FF7B27} 3.758 & \cellcolor[HTML]{FFE3D1} 2.582 & \cellcolor[HTML]{FFAF7C} 3.278\\
SVD$_{lora}$  & 2.446 & 150 & 5.82  & \cellcolor[HTML]{FFE9DB} 2.473  & \cellcolor[HTML]{FFAF7B} 3.283 & \cellcolor[HTML]{FFF0E7} 2.303 & \cellcolor[HTML]{FFD5BA} 2.815\\
SVD$_{sft}$   & \textbf{3.147} &  \textbf{143} & 6.08 & \cellcolor[HTML]{FFBC90} 3.139 & \cellcolor[HTML]{FF6400} 3.948 &  \cellcolor[HTML]{FFB17E} 3.261 & \cellcolor[HTML]{FF6E10} 3.868\\
SVD$_{flt}$   & 2.464 & 147 & 5.45  & \cellcolor[HTML]{FFE9DB} 2.463 & \cellcolor[HTML]{FFA064} 3.426 & \cellcolor[HTML]{FFE8DA} 2.485 & \cellcolor[HTML]{FFC29B} 3.061 \\ \hline
CogVideoX \cite{Yang2025}  & \textbf{2.877} & 165 & \textbf{2.98} &  \cellcolor[HTML]{FFCEAE} 2.912 & \cellcolor[HTML]{FFC5A0} 3.025 & \cellcolor[HTML]{FFE8D9} 2.495 & \cellcolor[HTML]{FFC49F} 3.033\\
CogVideoX$_{lora}$  &  2.869 & \textbf{149} & 2.95 & \cellcolor[HTML]{FFD0B2} 2.881 & \cellcolor[HTML]{FFC6A2} 3.008 & \cellcolor[HTML]{FFE8DA} 2.482 & \cellcolor[HTML]{FFB687} 3.206\\ \hline
Wan2.2-5B \cite{Wan2025}  & 2.041 & 258 & 2.26 & \cellcolor[HTML]{FFF9F6} 2.031 & \cellcolor[HTML]{FFD9C0} 2.752 & \cellcolor[HTML]{FFFFFF} 1.588 & \cellcolor[HTML]{FFB687} 3.205\\
Wan2.2-5B$_{lora}$   & 2.785 & \textbf{178} & 4.80 & \cellcolor[HTML]{FFD8C0} 2.760 & \cellcolor[HTML]{FFA46A} 3.390  & \cellcolor[HTML]{FFE4D3} 2.566 & \cellcolor[HTML]{FF802F} 3.716\\
Wan2.2-5B$_{sft}$  & \textbf{2.978} & 190 & \textbf{5.95} & \cellcolor[HTML]{FFC8A5} 2.990 & \cellcolor[HTML]{FF9D5E} 3.462 & \cellcolor[HTML]{FFCFB1} 2.888 & \cellcolor[HTML]{FFA971} 3.344 \\
Wan2.2-5B$_{flt}$  & 2.227 & 341 & 2.61 & \cellcolor[HTML]{FFF3EC} 2.227 & \cellcolor[HTML]{FFB585} 3.214 & \cellcolor[HTML]{FFFCFA} 1.908 & \cellcolor[HTML]{FFAB74} 3.325\\ \hline
\toprule[1.0pt]
\end{tabular}
}\vspace{-0.3cm}
\end{table}

The left part of Table \ref{tab:vid_gen_res} shows that SVD and Wan2.2 achieve notable improvements in PMF scores after fine-tuning, especially using SFT technique. This validates the effectiveness of \nickname{} in imbuing models with physical knowledge. We also observe that human perception of physical dynamics highly correlates with our newly introduced PMF metric. The right part of Table \ref{tab:vid_gen_res} shows that most models exhibit higher accuracy in magnetism and fluid, but lower scores in mechanics and optics, highlighting the challenges for future research in learning different types of physics. We will continue to benchmark the latest video generation models and update results on our \href{https://vlar-group.github.io/PhysInOne.html}{website}.