\subsection{Future Frame Prediction}
Accurate prediction of future frames necessitates a model's comprehension of underlying physical dynamics, with critical applications in autonomous driving, embodied AI, \etc{}. Input-output specifications may vary significantly in different applications. For example, in robot manipulation, given multiview videos as input, the model aims to predict precise dexterous control, where accurate and continuous short-term future predictions are essential for action execution. Conversely, video understanding tasks typically prioritize long-term predictions from monocular video inputs. Our collection of both multiview and monocular video data in \nickname{} enables demonstration of these diverse applications. This section introduces two tasks: long-term and short-term future frame prediction under varied settings.


\begin{figure*}[t]
\centering
\includegraphics[width=0.99\linewidth]{figs/mpm_cam2.pdf}
\vskip -0.1in
\caption{Qualitative resimulation results using estimated physical properties. Both baselines fail to accurately infer properties for complex objects against intricate backgrounds, leading to physically implausible outcomes. }
\label{fig:phys_prop_res}
\vspace{-0.2cm}
%\vskip 0.4in
\end{figure*}


\subsubsection{Long-term Future Frame Prediction}
In this experiment, models are tasked with predicting the second half of a dynamic 3D scene ($\sim$2.6 seconds ahead, $\sim$78 future frames) from the test set, given the first half video clip as input. We evaluate the following two groups of existing methods for this task.
\begin{itemize}[leftmargin=*] %\vspace{-0.2cm}
    \setlength{\itemsep}{1pt}
    \setlength{\parsep}{1pt}
    \setlength{\parskip}{1pt}
        \item \textit{4D Modeling Methods}: \textbf{TiNeuVox} \cite{Fang2022}, \textbf{DefGS} \cite{Yang2024c}, \textbf{FreeGave} \cite{Li2025c}, and \textbf{TRACE} \cite{Li2025b}. These methods model dynamic 3D scenes from multiview videos using scene-specific deformation or velocity fields, enabling future frame prediction from arbitrary (seen and novel) views. 
        \item \textit{Video Prediction Methods}: \textbf{ExtDM} \cite{Zhang2024}, and \textbf{MAGI-1} \cite{AI2025}. 
        ExtDM is trained from scratch on randomly sampled 83,650 videos (same as used in Section \ref{sec:exp_vid_gen}), while MAGI-1 is evaluated using its pretrained model.
\end{itemize}

Given that training scene-specific models for the entire test set is neither feasible nor necessary, we evaluate all six methods on a randomly selected subset of 103 test scenes, called \textit{test-mini}. This assesses their long-term future prediction capabilities for both seen and novel viewing angles. We report standard per-frame metrics \textbf{PSNR}/\textbf{SSIM}/\textbf{LPIPS}, along with our proposed dynamics metric, \textbf{PMF}. More details of experiment settings are provided in Appendix \ref{app:future_pred_exp}.
\begin{table}[thb] \tabcolsep=0.15cm \vspace{-0.3cm}
\centering
\caption{Quantitative results of long-term future frame prediction from seen / novel viewpoints on \nickname{}.}\vspace{-0.25cm}
\label{tab:long_future_pred_res}
\resizebox{0.48\textwidth}{!}{
\begin{tabular}{lccccc}
\toprule[1.0pt]
\rowcolor{headergray} & PMF $\uparrow$    & PSNR $\uparrow$ & SSIM $\uparrow$ & LPIPS$\downarrow$   \\ \toprule[1.0pt]
TiNeuVox \cite{Fang2022} & 3.710 / 2.885  & 21.49 / 15.20 & 0.633 / 0.452 & 0.517 / 0.665   \\
DefGS \cite{Yang2024c} & 3.980 / 3.347 & 22.85 / 17.95 & 0.833 / 0.598 & 0.192 / 0.348   \\
TRACE\cite{Li2025b}  & 3.869 / 3.242 & 22.42 / 17.44 & 0.756 / 0.599 & 0.295 / 0.422    \\
FreeGave \cite{Li2025c} & 3.897 / 3.265 & 22.57 / 17.75 & 0.818 / 0.619 & 0.219 / 0.355  \\ \hline

ExtDM \cite{Zhang2024} & 3.363 / -  & 19.55 / - & 0.657 / - & 0.771 / -    \\
MAGI-1 \cite{AI2025} & 4.086 / - & 23.14 / - & 0.788 / - & 0.364 / -     \\ \hline
\toprule[1.0pt]
\end{tabular}
}\vspace{-0.3cm}
\end{table}

From Table \ref{tab:long_future_pred_res}, we can see that current methods demonstrate reasonable future frame prediction for trained viewpoints, but fail to maintain quality under novel viewpoints. This underscores the significant challenge of modeling complex physical motions in 3D space, a gap we expect our dataset will inspire more advanced methods to address. 
Figure \ref{fig:future_pred_res} shows qualitative results.


\subsubsection{Continuous Short-term Future Frame Prediction}
In this task, we emulate potential robotic manipulation scenarios by requiring models to continuously predict the next 10 frames in a real time manner, given a stream of continuously observed frames as input. For efficiency, we evaluate four methods \textbf{DefGS} \cite{Yang2024c}, \textbf{FreeGave} \cite{Li2025c}, \textbf{ExtDM} \cite{Zhang2024}, and \textbf{MAGI-1} \cite{AI2025} on the same set of 103 dynamic 3D scenes on both seen and novel viewing angles. Table \ref{tab:short_future_pred_res} shows the quantitative results. More details of experiment settings are provided in Appendix \ref{app:future_pred_exp}.
\begin{table}[thb] \tabcolsep=0.15cm  \vspace{-0.3cm}
\centering
\caption{Quantitative results of short-term future frame prediction from seen / novel viewpoints on \nickname{}.}\vspace{-0.25cm}
\label{tab:short_future_pred_res}
\resizebox{0.48\textwidth}{!}{
\begin{tabular}{lccccc}
\toprule[1.0pt]
\rowcolor{headergray}    & PMF $\uparrow$  & PSNR $\uparrow$ & SSIM $\uparrow$ & LPIPS$\downarrow$  \\ \toprule[1.0pt]
DefGS \cite{Yang2024c} & 4.536 / 3.728  & 26.02 / 20.92 & 0.861 / 0.739 & 0.206 / 0.322   \\
FreeGave \cite{Li2025c} & 4.742 / 3.706 & 27.09 / 20.80 & 0.876 / 0.715 & 0.199 / 0.336   \\ \hline

ExtDM \cite{Zhang2024} & 3.774 / - & 22.14 / - & 0.717 / - & 0.715 / -    \\
MAGI-1 \cite{AI2025} & 4.696 / -  & 26.75 / - & 0.886 / - & 0.116 / -    \\ \hline
\toprule[1.0pt]
\end{tabular}
}\vspace{-0.3cm}
\end{table}